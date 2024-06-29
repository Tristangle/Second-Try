import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './components/auth/AuthContext';
import SurveyCreator from './components/SurveyCreator';
import SurveyResponse from './components/SurveyResponse';
import SurveyResults from './components/SurveyResults';
import VoteCreator from './components/VoteCreator';
import VoteResponse from './components/VoteResponse';
import VoteResults from './components/VoteResults';
import Vault from './components/vault/Vault';
import UserManager from './components/UserManager';
import './App.css';

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

const AppContent: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<string[][][]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteResponses, setVoteResponses] = useState<string[][][]>([]);
  const [currentView, setCurrentView] = useState<'surveys' | 'votes' | 'vault' | 'usermanager' | null>(null);
  const [showSurveyResults, setShowSurveyResults] = useState<boolean[]>([]);
  const [showVoteResults, setShowVoteResults] = useState<boolean[]>([]);
  const auth = useAuth();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/surveys', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (response.data && Array.isArray(response.data.surveys)) {
          setSurveys(response.data.surveys);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };
  
    fetchSurveys();
  }, [auth.user]);

  const addSurvey = (surveyData: { title: string; questions: SurveyQuestion[] }) => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:3000/surveys', surveyData, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
    .then(response => {
      const newSurvey = response.data;
      setSurveys([...surveys, newSurvey]);
      setShowSurveyResults([...showSurveyResults, false]);
    })
    .catch(error => {
      console.error('Error creating survey:', error);
    });
  };

  const handleSurveyResponseSubmit = (surveyIndex: number, response: string[]) => {
    const newResponses = [...surveyResponses];
    if (!newResponses[surveyIndex]) {
      newResponses[surveyIndex] = [];
    }
    newResponses[surveyIndex].push(response);
    setSurveyResponses(newResponses);
  };

  const addVote = (vote: Vote) => {
    setVotes([...votes, vote]);
    setShowVoteResults([...showVoteResults, false]);
  };

  const handleVoteResponseSubmit = (voteIndex: number, response: string[]) => {
    const newResponses = [...voteResponses];
    if (!newResponses[voteIndex]) {
      newResponses[voteIndex] = [];
    }
    newResponses[voteIndex].push(response);
    setVoteResponses(newResponses);
  };

  const toggleSurveyResults = (index: number) => {
    const newShowSurveyResults = [...showSurveyResults];
    newShowSurveyResults[index] = !newShowSurveyResults[index];
    setShowSurveyResults(newShowSurveyResults);
  };

  const toggleVoteResults = (index: number) => {
    const newShowVoteResults = [...showVoteResults];
    newShowVoteResults[index] = !newShowVoteResults[index];
    setShowVoteResults(newShowVoteResults);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/logout', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      localStorage.removeItem('token');
      window.location.href = '/login';  
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <button onClick={() => setCurrentView('surveys')}>Sondages</button>
        <button onClick={() => setCurrentView('votes')}>Votes</button>
        {(auth.user?.role === 'admin' || auth.user?.role === 'readonly') && (
          <>
            <button onClick={() => setCurrentView('vault')}>Coffre-fort</button>
            {auth.user?.role === 'admin' && (
              <button onClick={() => setCurrentView('usermanager')}>Gestion des utilisateurs</button>
            )}
          </>
        )}
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
      <div className="main-content">
        {currentView === 'surveys' && (
          <>
            {auth.user?.role === 'admin' && <SurveyCreator onAddSurvey={addSurvey} />}
            {Array.isArray(surveys) && surveys.map((survey, index) => (
              <div key={survey.id}>
                <h3>{survey.title}</h3>
                <button onClick={() => toggleSurveyResults(index)}>
                  {showSurveyResults[index] ? "Masquer les résultats" : "Afficher les résultats"}
                </button>
                {showSurveyResults[index] && (
                  <SurveyResults survey={survey} responses={surveyResponses[index] || []} />
                )}
                <SurveyResponse
                  survey={survey}
                  onSubmit={(response) => handleSurveyResponseSubmit(index, response)}
                />
              </div>
            ))}
          </>
        )}

        {currentView === 'votes' && (
          <>
            {auth.user?.role === 'admin' && <VoteCreator onAddVote={addVote} />}
            {votes.map((vote, index) => (
              <div key={index}>
                <h3>{vote.title}</h3>
                <p>Modalité de vote: {vote.mode}</p>
                {vote.comment && <p>Commentaire: {vote.comment}</p>}
                <button onClick={() => toggleVoteResults(index)}>
                  {showVoteResults[index] ? "Masquer les résultats" : "Afficher les résultats"}
                </button>
                {showVoteResults[index] && (
                  <VoteResults vote={vote} responses={voteResponses[index] || []} />
                )}
                <VoteResponse
                  vote={vote}
                  onSubmit={(response) => handleVoteResponseSubmit(index, response)}
                />
              </div>
            ))}
          </>
        )}

        {currentView === 'vault' && <Vault />}

        {currentView === 'usermanager' && <UserManager />}
      </div>
    </div>
  );
};

export default AppContent;
