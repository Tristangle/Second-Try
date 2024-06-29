import React from 'react';

interface VoteQuestion {
  questionText: string;
  options: string[];
}

interface Vote {
  title: string;
  questions: VoteQuestion[];
  mode: string;
  comment?: string;
}

interface VoteResultsProps {
  vote: Vote;
  responses: string[][];
}

const VoteResults: React.FC<VoteResultsProps> = ({ vote, responses }) => {
  const countResponses = (qIndex: number, option: string) => {
    return responses.reduce((count, response) => (response[qIndex] === option ? count + 1 : count), 0);
  };

  return (
    <div>
      <h2>Résultats du Vote: {vote.title}</h2>
      <p>Modalité de vote : {vote.mode}</p>
      {vote.comment && <p>Commentaire: {vote.comment}</p>}
      {vote.questions.map((question, qIndex) => (
        <div key={qIndex}>
          <p>{question.questionText}</p>
          <ul>
            {question.options.map((option, oIndex) => (
              <li key={oIndex}>
                {option}: {countResponses(qIndex, option)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default VoteResults;
