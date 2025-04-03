import { useState, useEffect } from 'react';
import '../components/AdminStyle/AdminHome.css';
import '../components/AdminStyle/schools.css';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import ChartComponent from '../components/AdminStyle/ChartComponent'; // Correct import for ChartComponent
import { ChartData, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Nav } from '../components/Nav';
import AdminUserCheck from '../components/userCheck';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function Schooldatafetch() {
  AdminUserCheck();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [avgOverallAvg, setAvgOverallAvg] = useState<number | null>(null);
  const [avgReadingScore, setAvgReadingScore] = useState<number | null>(null);
  const [avgListeningScore, setAvgListeningScore] = useState<number | null>(
    null,
  );
  const [avgSpeakingScore, setAvgSpeakingScore] = useState<number | null>(null);
  const [avgWritingScore, setAvgWritingScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]); // State to hold the records
  const [userDetails, setUserChartRecords] = useState<any[]>([]); // State for the new chart data
  const [topByOverallAvg, setTopByOverallAvg] = useState<any[]>([]); // State for top students by overall average
  const [topByExamsSolved, setTopByExamsSolved] = useState<any[]>([]); // State for top students by exams solved
  const [topByHighestStreak, setTopByHighestStreak] = useState<any[]>([]); // State for top students by highest streak

  // Extract school name from the URL
  const queryParams = new URLSearchParams(window.location.search);
  const schoolName = queryParams.get('school');

  // Fetch aggregates and user data together
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetching both aggregates and users data
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: `/schooldatafetch?school=${encodeURIComponent(
              schoolName || '',
            )}`,
          }),
        );

        // Log the API response for debugging
        console.log('API Response for schooldatafetch:', response);

        // Set state with the response data
        setStudentCount(response.student_count);
        setAvgOverallAvg(response.avg_overall_avg);
        setAvgReadingScore(response.avg_reading_score);
        setAvgListeningScore(response.avg_listening_score);
        setAvgSpeakingScore(response.avg_speaking_score);
        setAvgWritingScore(response.avg_writing_score);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (schoolName) {
      fetchData();
    }
  }, [schoolName]);

  // Fetch records data
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);

        // Fetch records data from the new API endpoint
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: `/schoolsstudenttable?school=${encodeURIComponent(
              schoolName || '',
            )}`,
          }),
        );

        // Log the API response for debugging
        console.log('API Response for schoolsstudenttable:', response);

        // Set the records state with the response data
        setRecords(response.records || []);
        // Set user data for chart
        setUserChartRecords(response.users || []);
      } catch (error) {
        console.error('Error fetching records data:', error);
        setError('Failed to fetch records data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (schoolName) {
      fetchRecords();
    }
  }, [schoolName]);

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

  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  // Define chart data for the sections (reading, writing, etc.)
  const sectionChartData: ChartData<'bar'> = {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'], // Place 'Regional Average' first
    datasets: [
      {
        data: [
          avgReadingScore,
          avgWritingScore,
          avgListeningScore,
          avgSpeakingScore,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)', // Reading
          'rgba(75, 192, 192, 0.2)', // Writing
          'rgba(75, 192, 192, 0.2)', // Listening
          'rgba(75, 192, 192, 0.2)', // Speaking
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)', // Reading
          'rgba(75, 192, 192, 1)', // Writing
          'rgba(75, 192, 192, 1)', // Listening
          'rgba(75, 192, 192, 1)', // Speaking
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for usernames and number of exams solved
  const userChartData: ChartData<'bar'> = {
    labels: userDetails.map(record => record.username || 'N/A'),
    datasets: [
      {
        label: 'Number of Exams Solved',
        data: userDetails.map(record => record.numberOfExamsSolved || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts from 0
        title: {
          display: true,
          text: 'IELTS section', // Label for the x-axis
        },
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts from 0
        title: {
          display: true,
          text: 'Average band score', // Label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          weight: 'bold',
        },
        formatter: value => {
          if (value == null) {
            return '-'; // Handle null or undefined values
          }
          return value;
        },
      },
    },
  };

  const chartOptionsforaverage: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts from 0
        title: {
          display: true,
          text: 'Student username', // Label for the x-axis
        },
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts from 0
        title: {
          display: true,
          text: 'Average score', // Label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          weight: 'bold',
        },
        formatter: value => {
          if (value == null) {
            return '-'; // Handle null or undefined values
          }
          return value;
        },
      },
    },
  };
  const chartOptionsforexams: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts from 0
        title: {
          display: true,
          text: 'Student username', // Label for the x-axis
        },
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts from 0
        title: {
          display: true,
          text: 'Number of exams taken', // Label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          weight: 'bold',
        },
        formatter: value => {
          if (value == null) {
            return '-'; // Handle null or undefined values
          }
          return value;
        },
      },
    },
  };

  const chartOptionsforstreak: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts from 0
        title: {
          display: true,
          text: 'Student username', // Label for the x-axis
        },
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts from 0
        title: {
          display: true,
          text: 'Number of days (Streaks)', // Label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          weight: 'bold',
        },
        formatter: value => {
          if (value == null) {
            return '-'; // Handle null or undefined values
          }
          return value;
        },
      },
    },
  };

  const chartOptionsnumberofexamsolved: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts from 0
        title: {
          display: true,
          text: 'Student username', // Label for the x-axis
        },
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts from 0
        title: {
          display: true,
          text: 'Number of Exams Solved', // Label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          weight: 'bold',
        },
        formatter: value => {
          if (value == null) {
            return '-'; // Handle null or undefined values
          }
          return value;
        },
      },
    },
  };

  // Bar chart data for each metric
  const getBarChartData = (students: any[], label: string) => {
    console.log(`Bar chart data for ${label}:`, students); // Debugging log
    return {
      labels: students.map(student => student.username),
      datasets: [
        {
          label: label,
          data: students.map(student => {
            switch (label) {
              case 'Highest Streak':
                return student.streakCounter; // Use streakCounter for highest streak
              case 'Overall Average':
                return student.overallAvg; // Use overallAvg for overall average
              case 'Exams Solved':
                return student.numberOfExamsSolved; // Use numberOfExamsSolved for exams solved
              default:
                return 0;
            }
          }),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  return (
    <div>
      {/* Navigation Bar */}
      <Nav entries={navLinks} />
      <main className="admin-home">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Current students in {schoolName}</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{studentCount !== null ? studentCount : 'N/A'}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Overall Average of Students in {schoolName}</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{avgOverallAvg !== null ? avgOverallAvg : 'N/A'}</p>
            )}
          </div>
        </div>
        <div>
          <h1 className="page-title">Student performance in {schoolName}</h1>
        </div>

        <div className="graphs-container">
          <div className="graph-left">
            <h3>Average score for Each IELTS Section</h3>
            <ChartComponent data={sectionChartData} options={chartOptions} />
          </div>

          <div className="graph-right">
            <h3>Number of Exams Solved by each student</h3>
            <ChartComponent
              data={userChartData}
              options={chartOptionsnumberofexamsolved}
            />
          </div>
        </div>

        <div className="graphs-container">
          <div className="graph-left">
            <h3>Top 3 Students by Highest Streak 🔥</h3>
            <Bar
              data={getBarChartData(topByHighestStreak, 'Highest Streak')}
              options={chartOptionsforstreak}
            />
          </div>

          <div className="graph-right">
            <h3>Top 3 Students by Overall Average</h3>
            <Bar
              data={getBarChartData(topByOverallAvg, 'Overall Average')}
              options={chartOptionsforaverage}
            />
          </div>
        </div>

        <div className="graph5">
          <h3>Top 3 Students by Exams Solved 📄</h3>
          <Bar
            data={getBarChartData(topByExamsSolved, 'Exams Solved')}
            options={chartOptionsforexams}
          />{' '}
        </div>

        <div className="table-header">All Records for {schoolName}</div>

        <div className="records-table">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Number of Exams Solved</th>
                <th>Listening Band Score</th>
                <th>Reading Band Score</th>
                <th>Speaking Band Score</th>
                <th>Writing Band Score</th>
                <th>Overall Average</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.username || 'N/A'}</td>
                    <td>{record.numberOfExamsSolved || 'N/A'}</td>
                    <td>{record.listeningBandScore || 'N/A'}</td>
                    <td>{record.readingBandScore || 'N/A'}</td>
                    <td>{record.speakingBandScore || 'N/A'}</td>
                    <td>{record.writingBandScore || 'N/A'}</td>
                    <td>{record.overallAvg || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>No records available</td>{' '}
                  {/* Corrected colSpan */}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Schooldatafetch;
