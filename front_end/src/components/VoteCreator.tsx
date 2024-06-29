import React, { useState } from 'react';
import axios from 'axios';

interface VoteQuestion {
  questionText: string;
  options: string[];
}

interface VoteCreatorProps {
  onAddVote: (vote: { title: string; questions: VoteQuestion[]; mode: string; comment?: string }) => void;
}

const VoteCreator: React.FC<VoteCreatorProps> = ({ onAddVote }) => {
  const [voteTitle, setVoteTitle] = useState('');
  const [questions, setQuestions] = useState<VoteQuestion[]>([{ questionText: '', options: [''] }]);
  const [mode, setMode] = useState('vote à un tour');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoteTitle(e.target.value);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: [''] }]);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!voteTitle.trim()) {
      setError('Le titre du vote ne peut pas être vide.');
      return;
    }
    for (const question of questions) {
      if (!question.questionText.trim()) {
        setError('Toutes les questions doivent avoir un texte.');
        return;
      }
      for (const option of question.options) {
        if (!option.trim()) {
          setError('Toutes les options doivent avoir un texte.');
          return;
        }
      }
    }
    setError(null);
    const vote = { title: voteTitle, questions, mode, comment };
    onAddVote(vote);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/votes', vote, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      console.log('Vote created:', response.data);
    } catch (error) {
      console.error('Error creating vote:', error);
    }
  };

  return (
    <div>
      <h2>Créer un Vote</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="text" value={voteTitle} onChange={handleTitleChange} placeholder="Titre du vote" />
      {questions.map((question, qIndex) => (
        <div key={qIndex}>
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
            placeholder={`Question ${qIndex + 1}`}
          />
          {question.options.map((option, oIndex) => (
            <input
              key={oIndex}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
              placeholder={`Option ${oIndex + 1}`}
            />
          ))}
          <button onClick={() => addOption(qIndex)}>Ajouter une option</button>
        </div>
      ))}
      <button onClick={addQuestion}>Ajouter une question</button>

      <div>
        <h3>Modalité de Vote</h3>
        <label>
          <input
            type="radio"
            value="vote à un tour"
            checked={mode === 'vote à un tour'}
            onChange={() => setMode('vote à un tour')}
          />
          Vote à un tour
        </label>
        <label>
          <input
            type="radio"
            value="vote à deux tours"
            checked={mode === 'vote à deux tours'}
            onChange={() => setMode('vote à deux tours')}
          />
          Vote à deux tours
        </label>
        <label>
          <input
            type="radio"
            value="majorité absolue"
            checked={mode === 'majorité absolue'}
            onChange={() => setMode('majorité absolue')}
          />
          Majorité absolue
        </label>
        <label>
          <input
            type="radio"
            value="majorité relative"
            checked={mode === 'majorité relative'}
            onChange={() => setMode('majorité relative')}
          />
          Majorité relative
        </label>
        {(mode === 'vote à deux tours' || mode === 'majorité absolue' || mode === 'majorité relative') && (
          <div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter un commentaire (ex: le 2eme tour aura lieu en date du 2 juin)"
            />
          </div>
        )}
      </div>

      <button onClick={handleSubmit}>Soumettre le vote</button>
    </div>
  );
};

export default VoteCreator;
