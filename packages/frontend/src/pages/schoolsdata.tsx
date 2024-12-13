import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import '../components/AdminStyle/AdminHome.css';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import ChartComponent from '../components/AdminStyle/ChartComponent'; // Correct import for ChartComponent
import { ChartData, ChartOptions } from 'chart.js';
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

  // Extract school name from the URL
  const queryParams = new URLSearchParams(window.location.search);
  const schoolName = queryParams.get('school');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Pass the school name as part of the API path
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: `/schooldatafetch?school=${encodeURIComponent(
              schoolName || '',
            )}`,
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
  }, [schoolName]);

  // Define chart data for the chart
  const chartData: ChartData<'bar'> = {
    labels: ['Reading', 'Writing', 'Listening', 'Speaking'],
    datasets: [
      {
        label: 'Average IELTS sections score',
        data: [
          avgReadingScore,
          avgWritingScore,
          avgListeningScore,
          avgSpeakingScore,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options (optional)
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <AdminHeader />
      <Navbar />
      <main className="admin-home">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Active Users</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{studentCount}</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Average</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <p>{avgOverallAvg}</p>
            )}
          </div>
        </div>

        <div
          className="graph-section"
          style={{ width: '100%', height: '1000px' }}
        >
          <div className="graph">
            <h3>Performance Overview</h3>
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Schooldatafetch;
