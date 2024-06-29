import React, { useState } from 'react';

interface SurveyQuestion {
  questionText: string;
  options?: string[];
  type: 'radio' | 'text';
}

interface Survey {
  title: string;
  questions: SurveyQuestion[];
}

interface SurveyResponseProps {
  survey: Survey;
  onSubmit: (responses: string[]) => void;
}

const SurveyResponse: React.FC<SurveyResponseProps> = ({ survey, onSubmit }) => {
  const [responses, setResponses] = useState<string[]>(Array(survey.questions.length).fill(''));

  const handleResponseChange = (qIndex: number, value: string) => {
    const newResponses = [...responses];
    newResponses[qIndex] = value;
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    onSubmit(responses);
    setResponses(Array(survey.questions.length).fill(''));
  };

  return (
    <div>
      <h2>{survey.title}</h2>
      {survey.questions.map((question, qIndex) => (
        <div key={qIndex}>
          <p>{question.questionText}</p>
          {question.type === 'radio' ? (
            question.options!.map((option, oIndex) => (
              <label key={oIndex}>
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={option}
                  onChange={(e) => handleResponseChange(qIndex, e.target.value)}
                />
                {option}
              </label>
            ))
          ) : (
            <textarea
              value={responses[qIndex]}
              onChange={(e) => handleResponseChange(qIndex, e.target.value)}
              placeholder="Votre réponse"
              rows={4}
              style={{ width: '100%', padding: '10px' }}
            />
          )}
        </div>
      ))}
      <button onClick={handleSubmit}>Soumettre les réponses</button>
    </div>
  );
};

export default SurveyResponse;
