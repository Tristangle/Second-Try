import React from 'react';

interface Survey {
  title: string;
  questions: { questionText: string; options: string[] }[];
}

interface SurveyListProps {
  surveys: Survey[];
}

const SurveyList: React.FC<SurveyListProps> = ({ surveys }) => {
  return (
    <div>
      <h2>Liste des Sondages</h2>
      {surveys.map((survey, index) => (
        <div key={index}>
          <h3>{survey.title}</h3>
          {survey.questions.map((question, qIndex) => (
            <div key={qIndex}>
              <p>{question.questionText}</p>
              <ul>
                {question.options.map((option, oIndex) => (
                  <li key={oIndex}>{option}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SurveyList;
