import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { Idea, IdeaHistory } from './entities/idea.entity';
import { v4 as uuidv4 } from 'uuid';
import { MongoRepository, Repository, WithoutId } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Choice } from './entities/choice.entity';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { Content, GoogleGenAI } from "@google/genai";
import { AiChat } from './entities/ai-chat.entity';
import { ChatResponseDto } from './dto/chat-response.dto';
import * as nodemailer from 'nodemailer';
import { User } from './entities/user.mysql-entity';
import { Contact } from './entities/contact.mysql-entity';


@Injectable()
export class IdeaService {

  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  model = "gemini-2.0-flash";

  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Idea)
    private ideaRepository: MongoRepository<Idea>,
    @InjectRepository(Choice)
    private choiceRepository: MongoRepository<Choice>,
    @InjectRepository(AiChat)
    private aiChatRepository: MongoRepository<AiChat>,
    @InjectRepository(User, "mysql")
    private userRepository: Repository<User>,
    @InjectRepository(Contact, "mysql")
    private contactRepository: Repository<Contact>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.smtpHost,
      port: 25,
      secure: false,
      tls: {
          rejectUnauthorized: false
      }
    });
  }

  // create and save a new idea document submitted by a user
  async createIdea(createIdeaDto: CreateIdeaDto, user: string) {
    const { title, description } = createIdeaDto;
    const status = 'S100';

    const existingTitles = await this.getAllTitles();
    if (existingTitles.includes(title.toLowerCase())) {
      throw new HttpException('This title already exist', HttpStatus.CONFLICT);
    }
    
    try {
      const idea: WithoutId<Idea> = {
        title,
        description,
        status,
        voteCount: 0,
        votes: [],
        comments: [],
        createdAt: new Date(),
        createdBy: user,
        modifiedAt: new Date(),
        modifiedBy: user,
        boolId: true,
        history: []
      }
      idea.history.push({
        id: uuidv4(),
        title,
        description,
        status,
        createdAt: new Date(),
        createdBy: user,
      });
      
      return await this.ideaRepository.save(idea);
    } 
    catch(error) {
      console.log(error);
      throw new HttpException('Idea saving failed', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  // get all ideas ranked by votes, filtered embedded arrays by boolId
  async getAllIdeas(user?: string, searchText?: string) {
    let matchCondition: any = {
      boolId: true
    };
    if (user) {
      matchCondition.votes = { $elemMatch: { createdBy: user, boolId: true } };
    }
    if (searchText) {
      matchCondition.title = { $regex: searchText + '$', $options: "i" }
    }
    console.log(matchCondition);
    
    const pipeline = [
      { 
        $match: matchCondition
      },
      { 
        $addFields: { 
          comments: { $filter: { 
            input: "$comments",      
            as: "comment",
            cond: { $eq: ["$$comment.boolId", true] }
          } } 
        } 
      },
      { 
        $addFields: { 
          votes: { $filter: { 
            input: "$votes",      
            as: "vote",
            cond: { $eq: ["$$vote.boolId", true] }
          } } 
        } 
      },
      { 
        $unset: "history" 
      },
      { 
        $lookup: {
          from: "choices",           // The choices collection
          localField: "status",      // The status field in the current document
          foreignField: "code",      // The code field in choices
          as: "statusChoice"         // The output array
        }
      },
      { 
        $addFields: { 
          status: { $arrayElemAt: ["$statusChoice.displayName", 0] } // Replace status with displayName
        } 
      },
      { 
        $unset: "statusChoice"       // Remove temporary lookup field
      },
      { 
        $sort: { createdAt: -1 } 
      },
    ]

    const ideas: Idea[] = await this.ideaRepository.aggregate(pipeline).toArray();

    return { ideas };
  }

  // helper: get one idea document given by its id, throw error if not found
  async findOne(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { _id: new ObjectId(id), boolId: true }
    });
    if (!idea) {
      throw new HttpException('idea is not found with this id', HttpStatus.NOT_FOUND);
    }
    return idea;
  }

  // get one idea by id and return
  async getIdea(id: string) {
    const idea = await this.findOne(id);
    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // update idea title and/or description and/or status by user
  async updateIdea(id: string, updateIdeaDto: UpdateIdeaDto, user: string, roles: string) {
    const idea = await this.findOne(id);
    const { title, description, status } = updateIdeaDto;
    if (!title && !description && !status) {
      return idea;
    }

    if (idea.createdBy !== user && !this.isAdmin(roles)) {
      throw new HttpException('You are not authorized to modify this idea', HttpStatus.UNAUTHORIZED);
    }

    idea.title = title ?? idea.title;
    idea.description = description ?? idea.description;
    idea.status = status ?? idea.status;
    idea.modifiedBy = user;
    idea.modifiedAt = new Date()
    idea.history.push({
      id: uuidv4(),
      ...updateIdeaDto,
      createdAt: new Date(),
      createdBy: user,
    });

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // remove an idea (set boolId = false)
  async removeIdea(id: string, user: string, roles: string) {
    const idea = await this.findOne(id);

    if (idea.createdBy !== user && !this.isAdmin(roles)) {
      throw new HttpException('You are not authorized to delete this idea', HttpStatus.UNAUTHORIZED);
    }

    idea.modifiedBy = user;
    idea.modifiedAt = new Date();
    idea.boolId = false;
    await this.ideaRepository.save(idea);

    return {message: 'idea deleted'};
  }

  // add a vote to an idea by a user
  async addVote(id: string, user: string) {
    const idea = await this.findOne(id);
    if (idea.votes.find(item => item.boolId && item.createdBy === user)) {
      throw new HttpException('You have already voted for this idea.', HttpStatus.NOT_ACCEPTABLE);
    }

    idea.votes.push({
      id: uuidv4(),
      createdBy: user,
      createdAt: new Date(),
      modifiedBy: user,
      modifiedAt: new Date(),
      boolId: true
    });
    idea.voteCount = idea.votes.filter(item => item.boolId).length;
    idea.modifiedBy = user
    idea.modifiedAt = new Date();

    const mailTo = await this.getCompanyMail(idea.createdBy);
    const subject = 'Vote received';
    const htmlText = `${user} szavazott az ötletedre: <strong>${idea.title}</strong>.`;
    if (mailTo) this.sendMail(mailTo, subject, htmlText);

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // remove a vote from an idea by a user
  async removeVote(id: string, user: string) {
    const idea = await this.findOne(id);
    const vote= idea.votes.find(item => item.createdBy === user && item.boolId);
    if (!vote) {
      throw new HttpException('Vote not found by this user.', HttpStatus.NOT_FOUND);
    }

    vote.boolId = false;
    vote.modifiedBy = user
    vote.modifiedAt = new Date();
    idea.voteCount = idea.votes.filter(item => item.boolId).length;
    idea.modifiedBy = user
    idea.modifiedAt = new Date();

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // add comment by user
  async addComment(id: string, text: string, user: string) {
    const idea = await this.findOne(id);

    // get sentiment
    const { aiChatRef, sentiment } = await this.getSentiment(idea.title, text, user);

    idea.comments.push({
      id: uuidv4(),
      text,
      aiChatRef,
      sentiment,
      createdBy: user,
      createdAt: new Date(),
      modifiedBy: user,
      modifiedAt: new Date(),
      boolId: true
    });

    return this.filterValidItems( 
      await this.ideaRepository.save(idea) 
    );
  }

  // remove a specific comment
  async removeComment(id: string, commentId: string, user: string) {
    const idea = await this.findOne(id);
    const comment = idea.comments.find(item => item.boolId && item.id === commentId);
    if (!comment) {
      throw new HttpException('Comment not found with this id.', HttpStatus.NOT_FOUND);
    }
    if (comment.createdBy !== user) {
      throw new HttpException('You are not authorized to delete this comment', HttpStatus.UNAUTHORIZED);
    }

    comment.boolId = false;
    comment.modifiedAt = new Date();
    comment.modifiedBy = user;

    await this.ideaRepository.save(idea);
    return {message: 'comment deleted'}
  }

  // bulk update idea status
  async statusUpdate(ideaIds: string[], status: string, user: string) {
    const now = new Date();
  
    const ideas = await this.ideaRepository.find({
      where: { _id: { $in: ideaIds.map(id => new ObjectId(id)) } },
    });
    
    let modCount = 0;
    for (const idea of ideas) {
      if (status !== idea.status) {
        idea.status = status;
        idea.modifiedAt = now;
        idea.modifiedBy = user;
        idea.history.push({
          id: uuidv4(),
          status,
          createdAt: now,
          createdBy: user,
        });
        modCount++
      }
    }
  
    await this.ideaRepository.save(ideas); 
    return { message: `Status updated for ${modCount} ideas.` };
  }

  // alternative for bulk update:
  /* async statusUpdate2(ideaIds: string[], status: string, user: string) {
    const now = new Date();
  
    const updateResult = await this.ideaRepository.updateMany(
      { _id: { $in: ideaIds.map(id => new ObjectId(id)) }, status: { $ne: status } }, 
      {
        $set: {
          status: status,
          modifiedAt: now,
          modifiedBy: user,
        },
        $push: {
          history: {
            id: uuidv4(),
            status: status,
            createdAt: now,
            createdBy: user,
          },
        },
      }
    );
  
    return { message: `Status updated for ${updateResult.modifiedCount} ideas.` };
  } */

  // add a new item to the choices collection
  async createChoice(createChoiceDto: CreateChoiceDto) {
    const choice: WithoutId<Choice> = {
      ...createChoiceDto,
      createdAt: new Date(),
      isSelectable: true
    }
    return await this.choiceRepository.save(choice);
  }

  // query the full list of choices (status)
  async getChoices() {
    const choices = await this.choiceRepository.find({where: {isSelectable: true}});
    return choices;
  }

  // helper: get existing idea titles
  async getAllTitles() {
    const ideas = await this.ideaRepository.find({
      where: {
        boolId: true, 
      },
      select: {
        title: true,
      },
    });
  
    return ideas.map(idea => idea.title.toLowerCase());
  }


  // AI function testing
  async aiTest(message: string): Promise<any> {
    const systemInstruction = 'You are helpful advisor. Provide short and concise answers.';
    const chat = this.ai.chats.create({
      model: this.model,
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to know?" }],
        },
      ],
      config: {
        maxOutputTokens: 100,
        temperature: 1.0,
        systemInstruction,
      },

    });
  
    const response = await chat.sendMessage({
      message,
    });

    return response.text;
  }

  // start a new chat with Gemini
  async createAiChat(type: string, message: string, user: string): Promise<ChatResponseDto> {
    const systemInstruction = 'You are a professional team building organizer. Answer each question of the client in a short and consize way, in maximum 100 words.';
    const history: Content[] = [];
    const now = new Date();

    // create a new mongo document object
    const aiChatDoc: WithoutId<AiChat> = {
      type: 'advisory',
      systemPrompt: systemInstruction,
      chatMessages: [{
        id: uuidv4(),
        role: 'user',
        text: message,
        createdAt: now
      }],
      createdAt: now,
      createdBy: user,
      modifiedAt: now,
      modifiedBy: user,
      boolId: true
    }

     // initialize Gemini chat and send out the message
    const chat = this.ai.chats.create({
      model: this.model,
      history,
      config: {
        maxOutputTokens: 150,
        temperature: 1.5,
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message,
    });

    // push response data to the mongo document
    aiChatDoc.chatMessages.push({
      id: uuidv4(),
      role: 'model',
      text: response.text,
      createdAt: new Date()
    })

    // save document to db and return selected fields
    const doc = await this.aiChatRepository.save(aiChatDoc);
    return { id: doc._id.toString(), chatMessages: doc.chatMessages };
  }

  // continue existing chat with Gemini
  async appendAiChat(id: string, message: string, user: string): Promise<ChatResponseDto> {

    // read document from mongo
    const aiChatDoc = await this.aiChatRepository.findOne({where: {_id: new ObjectId(id), boolId: true}});
    if (!aiChatDoc) {
      throw new HttpException('Chat not foind with this id', HttpStatus.NOT_FOUND);
    }

    // map history from document
    const history: Content[] = aiChatDoc.chatMessages.map(item => {
      return {
        role: item.role,
        parts: [{ text: item.text }]
      }
    });

    // initialize Gemini chat and send out the message
    const chat = this.ai.chats.create({
      model: this.model,
      history,
      config: {
        maxOutputTokens: 150,
        temperature: 1.8,
        systemInstruction: aiChatDoc.systemPrompt,
      },
    });

    const response = await chat.sendMessage({
      message,
    });

    // push message and response data to the mongo document
    aiChatDoc.chatMessages.push( 
      {
        id: uuidv4(),
        role: 'user',
        text: message,
        createdAt: new Date()
      }, 
      {
        id: uuidv4(),
        role: 'model',
        text: response.text,
        createdAt: new Date()
      } 
    );

    // save document to db and return selected fields
    const doc = await this.aiChatRepository.save(aiChatDoc);
    return { id: doc._id.toString(), chatMessages: doc.chatMessages };
  }

  // evaluate the sentiment of a comment text
  async getSentiment(title: string, commentText: string, user: string) {
    const systemInstruction = 'You are a supervisor, who evaluates comments on team building ideas. You will receive the title of the ida and the text of the comment. Decide, whether the comment is positive (supports the idea) or negative or neutral. Answer in 1 word only, one of these options: "Positive", "Negative", "Neutral"';
    const history: Content[] = [
      {
        role: 'user',
        parts: [{ text: `Idea title: Hiking; Comment: Great, I love hiking.` }],
      },
      {
        role: 'model',
        parts: [{ text: 'Positive.' }],
      },
    ];
    const now = new Date();
    const message = `Idea title: ${title}; Comment: ${commentText}`

    // create a new mongo document object
    const aiChatDoc: WithoutId<AiChat> = {
      type: 'sentiment',
      systemPrompt: systemInstruction,
      chatMessages: [{
        id: uuidv4(),
        role: 'user',
        text: message,
        createdAt: now
      }],
      createdAt: now,
      createdBy: user,
      modifiedAt: now,
      modifiedBy: user,
      boolId: true
    }

     // initialize Gemini chat and send out the message
    const chat = this.ai.chats.create({
      model: this.model,
      history,
      config: {
        maxOutputTokens: 150,
        temperature: 1.5,
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message,
    });

    // push response data to the mongo document
    aiChatDoc.chatMessages.push({
      id: uuidv4(),
      role: 'model',
      text: response.text,
      createdAt: new Date()
    })

    // save document to db
    const doc = await this.aiChatRepository.save(aiChatDoc);
    let sentiment = 'neutral';

    // respond with result and chat document reference
    if (response.text.toLowerCase().includes('positive')) sentiment = 'positive';
    if (response.text.toLowerCase().includes('negative')) sentiment = 'negative';
    return {aiChatRef: doc._id.toString(), sentiment};
  }


  // helper function: filter embedded arrays of an idea by boolId
  filterValidItems(idea: Idea): Idea {
    return {
      ...idea,
      votes: idea.votes.filter(i => i.boolId),
      comments: idea.comments.filter(i => i.boolId),
    }
  }

  // helper function: check if the current user has admin role
  isAdmin(roles: string) {
    return roles.split(', ').includes('admin');
  }

  isSupervisor(roles: string) {
    return roles.split(', ').includes('supervisor');
  }

  isModerator(roles: string) {
    return roles.split(', ').includes('moderator');
  }

  // helper function: send mail
  async sendMail(
    to: string,
    subject: string,
    htmlText: string,
  ): Promise<{message: string}> {
    try {
        const info = await this.transporter.sendMail({
            from: 'nestjs-training@telekom.hu',
            to,
            subject,
            html: htmlText,
        });
        console.log(info);
        return { message: 'Mail is successfully sent' }
    } catch (err) {
        console.log('Error sending email:', err);
        throw new Error('Failed to send email');
    }
  }

  // get contact data
  async getContacts() {
    return await this.contactRepository.find({
      // relations: ['user']
    });
  }

  // get user data
  async getUsers() {
    return await this.userRepository.find({
      // relations: ['contacts']
    });
  }

  // helper: get company email by userName - version 1
  async getCompanyMail(user: string) {
    const contact = await this.contactRepository.findOne({
      where: { contactType: 'company', user: { userName: user } },
      relations: ['user']
    });
    return contact?.email;
  }

  // helper: get company email by userName - version 2
  async getCompanyMailV2(user: string) {
    const contact = await this.contactRepository.createQueryBuilder('contact')
    .innerJoinAndSelect('contact.user', 'user')
    .where('contact.contactType = :type', { type: 'company' })
    .andWhere('user.userName = :userName', { userName: user })
    .getOne();

    return contact?.email;
  }

  /* SQL version:

  SELECT 
    contact.*, 
    user.*
  FROM mean_pr.training_contacts AS contact
  INNER JOIN mean_pr.training_users AS user 
    ON contact.userTrusId = user.trus_id
  WHERE contact.contact_type = 'company'
    AND user.user_name = 'some_username'
  LIMIT 1;

  */

  async searchUsers(searchText: string) {
    const results = await this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.email LIKE :pattern', { pattern: `%${searchText}%` })
      .innerJoin('contact.user', 'user')
      .select([
        'user.fullName AS fullName',
        'contact.email AS email',
      ])
      .getRawMany();
      //.getSql();
    
    return results;
  }

  /* SQL version - searchText = "gmail":

  SELECT 
    user.full_name AS fullName, 
    contact.email AS email
  FROM mean_pr.training_contacts AS contact
  INNER JOIN mean_pr.training_users AS user
    ON contact.userTrusId = user.trus_id
  WHERE contact.email LIKE '%gmail%';

  */

}
