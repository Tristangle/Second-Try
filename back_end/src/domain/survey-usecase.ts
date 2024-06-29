import { DataSource } from 'typeorm';
import { Survey } from '../database/entities/Survey';
import { SurveyQuestion } from '../database/entities/SurveyQuestion';
import { CreateSurveyRequest } from '../handlers/validators/survey-validation';

export class SurveyUsecase {
  constructor(private readonly db: DataSource) {}

  async createSurvey(data: CreateSurveyRequest): Promise<Survey> {
    const surveyRepository = this.db.getRepository(Survey);
    const questionRepository = this.db.getRepository(SurveyQuestion);

    const survey = surveyRepository.create({
      title: data.title,
      questions: data.questions.map(q => ({
        questionText: q.questionText,
        type: q.type,
        options: q.options,
      })),
    });

    await surveyRepository.save(survey);
    await questionRepository.save(survey.questions);

    return survey;
  }

  async listSurveys(page: number, result: number): Promise<{ surveys: Survey[] }> {
    const query = this.db.getRepository(Survey)
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.questions', 'question')
      .take(result)
      .skip((page - 1) * result);

    const surveys = await query.getMany();
    return { surveys };
  }

  async deleteSurvey(surveyId: number): Promise<void> {
    const surveyRepository = this.db.getRepository(Survey);
    const survey = await surveyRepository.findOneBy({ id: surveyId });
    if (survey) {
      await surveyRepository.remove(survey);
    }
  }
}
