//without trendline

import { useState, useEffect } from 'react';
import '../components/AdminStyle/AdminHome.css';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import adminUserCheck from '../components/userCheck';
import ChartComponent from '../components/AdminStyle/ChartComponent'; // Correct import for ChartComponent
import { ChartData, ChartOptions } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Nav } from '../components/Nav';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-plugin-annotation';
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
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

function AdminHome() {
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

  const [schools, setSchools] = useState<string[]>([]); // State for schools

  const [schoolScores, setSchoolScores] = useState<
    { schoolName: string; avg_overall_avg: number }[]
  >([]); // New state to hold school scores for the second graph
  const [readingVsListening, setReadingVsListening] = useState<
    { x: number; y: number }[]
  >([]);
  const [readingVsWriting, setReadingVsWriting] = useState<
    { x: number; y: number }[]
  >([]);
  const [readingVsSpeaking, setReadingVsSpeaking] = useState<
    { x: number; y: number }[]
  >([]);
  const [listeningVsWriting, setListeningVsWriting] = useState<
    { x: number; y: number }[]
  >([]);
  const [listeningVsSpeaking, setListeningVsSpeaking] = useState<
    { x: number; y: number }[]
  >([]);
  const [writingVsSpeaking, setWritingVsSpeaking] = useState<
    { x: number; y: number }[]
  >([]);
  const [scatterData, setScatterData] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [userStreakData, setUserStreakData] = useState<
    { username: string; streakCounter: number }[]
  >([]);
  const [streakVsAvgData, setStreakVsAvgData] = useState<
    { x: number; y: number }[]
  >([]);
  const [topByOverallAvg, setTopByOverallAvg] = useState<any[]>([]);
  const [topByExamsSolved, setTopByExamsSolved] = useState<any[]>([]);
  const [topByHighestStreak, setTopByHighestStreak] = useState<any[]>([]);

  useEffect(()=>{
    adminUserCheck();
  })
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/getAggregates',
          }),
        );

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

    fetchData();
  }, []);

  // Fetch list of schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/listofschools',
          }),
        );

        // Assuming response.schools contains the list of school names
        if (response.schools) {
          setSchools(response.schools);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
        setError('Failed to fetch the list of schools.');
      }
    };

    fetchSchools();
  }, []);

  // Fetch school scores for the second graph
  useEffect(() => {
    const fetchSchoolScores = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/secondgraph',
          }),
        );

        // Assuming the response is an array of school names with their avg_overall_avg
        if (response && Array.isArray(response)) {
          setSchoolScores(response);
        }
      } catch (error) {
        console.error('Error fetching school scores:', error);
        setError('Failed to fetch school scores.');
      }
    };

    fetchSchoolScores();
  }, []);
  useEffect(() => {
    const fetchCorrelationData = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/correlation',
          }),
        );
        console.log('API response:', response); // Logs the API response to the console

        // Assuming response.graphData contains the data for the 7 graphs
        if (response && response.graphData) {
          setScatterData(response.graphData.avg); // Example: Set the first graph data
          // Set the other graphs data
          setReadingVsListening(response.graphData.readingVsListening);
          setReadingVsWriting(response.graphData.readingVsWriting);
          setReadingVsSpeaking(response.graphData.readingVsSpeaking);
          setListeningVsWriting(response.graphData.listeningVsWriting);
          setListeningVsSpeaking(response.graphData.listeningVsSpeaking);
          setWritingVsSpeaking(response.graphData.writingVsSpeaking);
        }
      } catch (error) {
        console.error('Error fetching correlation data:', error);
        setError('Failed to fetch correlation data.');
      }
    };

    fetchCorrelationData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/streaksgraphoverall',
          }),
        );

        // Map the response to the data needed
        const userStreak = response.results.map((item: any) => ({
          username: item.Username,
          streakCounter: item.StreakCounter,
        }));
        setUserStreakData(userStreak);

        const streakVsAvg = response.results.map((item: any) => ({
          x: item.StreakCounter,
          y: item.OverallAvg,
        }));
        setStreakVsAvgData(streakVsAvg);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Fetch top students data
  useEffect(() => {
    const fetchTopStudents = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/studentperformance',
          }),
        );
        if (response) {
          setTopByOverallAvg(response.topByOverallAvg || []);
          setTopByExamsSolved(response.topByExamsSolved || []);
          setTopByHighestStreak(response.topByHighestStreak || []);
        }
      } catch (error) {
        console.error('Error fetching top students:', error);
        setError('Failed to fetch top students data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopStudents();
  }, []);
  // Handle school change
  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchool = event.target.value;
    window.location.href = `/schooldatagraph?school=${encodeURIComponent(
      selectedSchool,
    )}`;
  };

  // Define chart data for the first chart (IELTS scores)
  const chartData: ChartData<'bar'> = {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
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

  const secondChartData: ChartData<'bar'> = {
    labels: schoolScores.map(item => item.schoolName), // School names as labels
    datasets: [
      {
        label: 'Average School Score',
        data: schoolScores.map(item => item.avg_overall_avg), // School scores
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light blue color
        borderColor: 'rgba(75, 192, 192, 1)', // Darker blue for the border
        borderWidth: 1,
      },
      {
        label: 'Regional Average', // Fixed label for regional average
        data: schoolScores.map(() => 6.5), // Set the regional average value for each school
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Light red color for regional average
        borderColor: 'rgba(255, 99, 132, 1)', // Darker red for the border
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
  const chartOptions1: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts from 0
        title: {
          display: true,
          text: 'School name', // Label for the x-axis
        },
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts from 0
        title: {
          display: true,
          text: 'Average test score', // Label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: true, // Show the legend
        labels: {
          generateLabels: () => {
            // Custom labels for the legend
            return [
              {
                text: 'Regional Average (6.5)',
                fillStyle: 'rgba(255, 99, 132, 0.2)', // Red color for Regional Average
                strokeStyle: 'rgba(255, 99, 132, 1)', // Red border for Regional Average
              },
              {
                text: 'Bahrain Schools Average',
                fillStyle: 'rgba(75, 192, 192, 0.2)', // Green color for Bahrain Schools Average
                strokeStyle: 'rgba(75, 192, 192, 1)', // Green border for Bahrain Schools Average
              },
            ];
          },
        },
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

  const chartOptionsusernamestreak: ChartOptions<'bar'> = {
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

  const barChartData: ChartData<'bar'> = {
    labels: userStreakData.map(item => item.username), // Usernames as labels
    datasets: [
      {
        label: 'Streak Counter',
        data: userStreakData.map(item => item.streakCounter),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Scatter plot data (StreakCounter vs OverallAvg)
  const scatterChartData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Streak Counter vs Overall Avg',
        data: streakVsAvgData,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        pointRadius: 5,
      },
    ],
  };

  const avgChartData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Exams Solved vs. Average Score',
        data: scatterData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
      },
    ],
  };

  const readingVsListeningData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Reading Score vs Listening Score',
        data: readingVsListening,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
      },
    ],
  };

  const readingVsWritingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Reading vs. Writing Score',
        data: readingVsWriting,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
      },
    ],
  };

  const readingVsSpeakingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Reading Score vs Speaking Score',
        data: readingVsSpeaking,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
      },
    ],
  };

  const listeningVsWritingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Listening Score vs Writing Score',
        data: listeningVsWriting,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
      },
    ],
  };

  const listeningVsSpeakingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Listening Score vs Speaking Score',
        data: listeningVsSpeaking,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
      },
    ],
  };

  const writingVsSpeakingData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Writing Score vs Speaking Score',
        data: writingVsSpeaking,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
      },
    ],
  };

  const scatterChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Streak Counter',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Overall Avg',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const avgChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Exams Solved',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const readingVsListeningOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reading Score',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Listening Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const readingVsWritingOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reading Score',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Writing Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const readingVsSpeakingOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reading Score',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Speaking Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const listeningVsWritingOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Listening Score',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Writing Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const listeningVsSpeakingOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Listening Score',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Speaking Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
      },
    },
  };

  const writingVsSpeakingOptions: ChartOptions<'scatter'> = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Writing Score',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Speaking Score',
        },
      },
    },
    plugins: {
      datalabels: {
        display: false, // Disable datalabels
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
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  return (
    <div>
      {/* Navigation Bar */}
      <Nav entries={navLinks} />
      <main className="admin-home">
        <h3 className="HelloAdmin">Hello Admin,</h3>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Current students across Bahrain</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{studentCount}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Overall Average of Students Across Bahrain</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{avgOverallAvg}</p>
            )}
          </div>
        </div>
        <div>
          <h1 className="page-title">
            English Proficiency Levels Across Bahrain
          </h1>
        </div>

        <div className="graphs-container">
          <div className="graph-left">
            <h3>Average score for Each IELTS Section</h3>
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
          <div className="graph-right">
            <h3>Average score of each school in Bahrain </h3>
            <ChartComponent data={secondChartData} options={chartOptions1} />
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

        <div className="graphs-container">
          <div className="graph-left">
            <h3>Top 3 Students by Exams Solved 📄</h3>
            <Bar
              data={getBarChartData(topByExamsSolved, 'Exams Solved')}
              options={chartOptionsforexams}
            />{' '}
          </div>

          <div className="scatter-plot">
            <h3>Correlation: Exams Solved vs. Average Score</h3>
            {scatterData.length > 0 ? (
              <Scatter data={avgChartData} options={avgChartOptions} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading scatter plot data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="graph-right">
            <h3>Streak Counter vs Overall Average</h3>
            {streakVsAvgData.length > 0 ? (
              <Scatter data={scatterChartData} options={scatterChartOptions} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading scatter plot data...</p>
            )}
          </div>
          <div className="graph-right">
            <h3>Username vs Streak Counter</h3>
            {userStreakData.length > 0 ? (
              <Bar data={barChartData} options={chartOptionsusernamestreak} />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Reading vs Writing</h3>
            {readingVsWriting.length > 0 ? (
              <Scatter
                data={readingVsWritingData}
                options={readingVsWritingOptions}
              />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
          <div className="scatter-plot">
            <h3>Correlation: Reading vs Speaking</h3>
            {readingVsSpeaking.length > 0 ? (
              <Scatter
                data={readingVsSpeakingData}
                options={readingVsSpeakingOptions}
              />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Listening vs Writing</h3>
            {listeningVsWriting.length > 0 ? (
              <Scatter
                data={listeningVsWritingData}
                options={listeningVsWritingOptions}
              />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>

          <div className="scatter-plot">
            <h3>Correlation: Listening vs Speaking</h3>
            {listeningVsSpeaking.length > 0 ? (
              <Scatter
                data={listeningVsSpeakingData}
                options={listeningVsSpeakingOptions}
              />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="graphs-container">
          <div className="scatter-plot">
            <h3>Correlation: Reading vs Listening</h3>
            {readingVsListening.length > 0 ? (
              <Scatter
                data={readingVsListeningData}
                options={readingVsListeningOptions}
              />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
          <div className="scatter-plot">
            <h3>Correlation: Writing vs Speaking</h3>
            {writingVsSpeaking.length > 0 ? (
              <Scatter
                data={writingVsSpeakingData}
                options={writingVsSpeakingOptions}
              />
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>

        <div className="school-selector">
          <h3>
            Select a School to View Detailed Dashboard for Each Institution
          </h3>
          {error ? (
            <p>{error}</p>
          ) : (
            <select onChange={handleSchoolChange}>
              <option value="" disabled selected>
                Select a school
              </option>
              {schools.map((school, index) => (
                <option key={index} value={school}>
                  {school}
                </option>
              ))}
            </select>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminHome;
