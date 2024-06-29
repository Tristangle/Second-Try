import React from 'react';

interface SurveyQuestion {
  questionText: string;
  options?: string[];
  type: 'radio' | 'text';
}

interface Survey {
  id: number;
  title: string;
  questions: SurveyQuestion[];
}

interface SurveyResultsProps {
  survey: Survey;
  responses: string[][];
}

const SurveyResults: React.FC<SurveyResultsProps> = ({ survey, responses }) => {
  return (
    <div>
      <h3>Résultats pour: {survey.title}</h3>
      {survey.questions.map((question, qIndex) => (
        <div key={qIndex}>
          <h4>{question.questionText}</h4>
          {question.type === 'radio' && (
            <ul>
              {question.options?.map((option, oIndex) => (
                <li key={oIndex}>
                  {option}: {responses.filter(response => response[qIndex] === option).length}
                </li>
              ))}
            </ul>
          )}
          {question.type === 'text' && (
            <ul>
              {responses.map((response, rIndex) => (
                <li key={rIndex}>{response[qIndex]}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default SurveyResults;
