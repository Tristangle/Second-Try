import { DataSource } from 'typeorm';
import { Vote } from '../database/entities/vote';
import { VoteQuestion } from '../database/entities/votequestion';
import { CreateVoteRequest } from '../handlers/validators/vote-validation';
import { User } from "../database/entities/user";

export interface ListVoteFilter {
  page: number;
  result: number;
}

export class VoteUsecase {
    constructor(private readonly db: DataSource) {}

   
    async createVote(data: CreateVoteRequest, userId: number): Promise<Vote> {
      const voteRepository = this.db.getRepository(Vote);
      const questionRepository = this.db.getRepository(VoteQuestion);
      const userRepository = this.db.getRepository(User);
  
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new Error("User not found");
      }
  
      const questions = data.questions.map(q => {
        const voteQuestion = questionRepository.create({
          questionText: q.questionText,
          options: q.options.map(option => ({ text: option }))
        });
        return voteQuestion;
      });
  
      const vote = voteRepository.create({
        title: data.title,
        mode: data.mode,
        comment: data.comment,
        questions,
        createdBy: user,
      });
  
      await voteRepository.save(vote);
      await questionRepository.save(questions);
  
      return vote;
    }
  async voteList(filter: ListVoteFilter): Promise<{ votes: Vote[] }> {
    const query = this.db.getRepository(Vote)
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.questions', 'question')
      .leftJoinAndSelect('question.options', 'option')
      .take(filter.result)
      .skip((filter.page - 1) * filter.result);

    const votes = await query.getMany();
    return { votes };
  }
}
