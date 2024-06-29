import React, { useState } from 'react';

interface SurveyQuestion {
  questionText: string;
  options?: string[];
  type: 'radio' | 'text';
}

interface SurveyCreatorProps {
  onAddSurvey: (survey: { title: string; questions: SurveyQuestion[] }) => void;
}

const SurveyCreator: React.FC<SurveyCreatorProps> = ({ onAddSurvey }) => {
  const [surveyTitle, setSurveyTitle] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([{ questionText: '', type: 'radio', options: [''] }]);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurveyTitle(e.target.value);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options![oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (index: number, type: 'radio' | 'text') => {
    const newQuestions = [...questions];
    newQuestions[index].type = type;
    if (type === 'text') {
      delete newQuestions[index].options;
    } else {
      newQuestions[index].options = [''];
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', type: 'radio', options: [''] }]);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options!.push('');
    setQuestions(newQuestions);
  };

  const handleSubmit = () => {
    if (!surveyTitle.trim()) {
      setError('Le titre du sondage ne peut pas être vide.');
      return;
    }
    for (const question of questions) {
      if (!question.questionText.trim()) {
        setError('Toutes les questions doivent avoir un texte.');
        return;
      }
      if (question.type === 'radio') {
        for (const option of question.options!) {
          if (!option.trim()) {
            setError('Toutes les options doivent avoir un texte.');
            return;
          }
        }
      }
    }
    setError(null);
    onAddSurvey({ title: surveyTitle, questions });
  };

  return (
    <div>
      <h2>Créer un sondage</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="text" value={surveyTitle} onChange={handleTitleChange} placeholder="Titre du sondage" />
      {questions.map((question, qIndex) => (
        <div key={qIndex}>
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
            placeholder={`Question ${qIndex + 1}`}
          />
          <label>
            <input
              type="radio"
              checked={question.type === 'radio'}
              onChange={() => handleQuestionTypeChange(qIndex, 'radio')}
            />
            Radio
          </label>
          <label>
            <input
              type="radio"
              checked={question.type === 'text'}
              onChange={() => handleQuestionTypeChange(qIndex, 'text')}
            />
            Texte
          </label>
          {question.type === 'radio' && question.options!.map((option, oIndex) => (
            <input
              key={oIndex}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
              placeholder={`Option ${oIndex + 1}`}
            />
          ))}
          {question.type === 'radio' && <button onClick={() => addOption(qIndex)}>Ajouter une option</button>}
        </div>
      ))}
      <button onClick={addQuestion}>Ajouter une question</button>
      <button onClick={handleSubmit}>Soumettre le sondage</button>
    </div>
  );
};

export default SurveyCreator;
