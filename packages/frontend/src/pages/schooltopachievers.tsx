import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import '../components/AdminStyle/AdminHome.css';
import { get } from 'aws-amplify/api';
import '../components/AdminStyle/studentperformance.css';
import { toJSON } from '../utilities';
import AdminUserCheck from '../components/userCheck';

function schooltopachievers() {
  AdminUserCheck();
  const [topByOverallAvg, setTopByOverallAvg] = useState<any[]>([]); // State for top students by overall average
  const [topByExamsSolved, setTopByExamsSolved] = useState<any[]>([]); // State for top students by exams solved
  const [topByHighestStreak, setTopByHighestStreak] = useState<any[]>([]); // State for top students by highest streak
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [error, setError] = useState<string | null>(null); // State for error handling
  
// Extract school name from the URL
const queryParams = new URLSearchParams(window.location.search);
const schoolName = queryParams.get('school');

  // Fetch top students by overall average, exams solved, and highest streak
  useEffect(() => {
    const fetchTopStudents = async () => {
      try {
        setLoading(true);

        // Pass the school name as part of the API path
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: `/schooltopachievers?school=${encodeURIComponent(
              schoolName || '',
            )}`,
          }),
        );
        console.log(response); // Add this line to inspect the response
        if (response) {
          setTopByOverallAvg(response.topByOverallAvg || []);
          setTopByExamsSolved(response.topByExamsSolved || []);
          setTopByHighestStreak(response.topByHighestStreak || []); // New data for highest streak
        }
      } catch (error) {
        console.error('Error fetching top students:', error);
        setError('Failed to fetch top students data.');
      } finally {
        setLoading(false); // Set loading to false after the data is fetched
      }
    };

    fetchTopStudents();
  }, []);

  return (
    <div>
      <AdminHeader />
      <Navbar />
      <main className="admin-home">
         {/* Page Title */}
         <h1 className="page-title">
  Top Achievers in {schoolName}: Excel in Your Practice Journey
         </h1>
        {/* Top Students by Overall Average */}
        <div className="top-students-section">
          <h3 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
            Top 3 Students by Overall Average
            <span>📊 </span>{' '}
          </h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <ul className="top-students-list">
              {topByOverallAvg.map((student, index) => (
                <li key={index} className="top-student-item">
                  <strong>{student.username}</strong> from {student.school} -{' '}
                  <span className="student-score">
                    {' '}
                    Score: {student.overallAvg}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Students by Exams Solved */}
        <div className="top-students-section">
          <h3 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
            Top 3 Students by Exams Solved
            <span className="ml-4 inline-flex items-center text-blue-500">
              📄
            </span>
          </h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <ul className="top-students-list">
              {topByExamsSolved.map((student, index) => (
                <li key={index} className="top-student-item">
                  <strong>{student.username}</strong> from {student.school} -{' '}
                  <span className="student-exams-solved">
                    {student.numberOfExamsSolved} exams solved
                  </span>{' '}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Students by Highest Streak */}
        <div className="top-students-section">
          <h3 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
            Top 3 Students by Highest Streak{' '}
            <span className="ml-4 inline-flex items-center text-yellow-500">
              🔥{' '}
            </span>
          </h3>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <ul className="top-students-list">
              {topByHighestStreak.map((student, index) => (
                <li key={index} className="top-student-item">
                  <strong>{student.username}</strong> from {student.school} -{' '}
                  <span className="student-streak">
                    {student.streakCounter} days streak
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
          

      </main>

      {/* Trophy image with animation */}
      <div className="trophy-container">
        <img src="/assets/trophy.png" alt="Trophy" className="trophy" />
      </div>
    </div>
    
  );
}


export default schooltopachievers;


