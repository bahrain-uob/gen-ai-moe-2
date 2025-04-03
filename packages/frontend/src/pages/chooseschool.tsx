import { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import AdminUserCheck from '../components/userCheck';

function SchoolsList() {
  AdminUserCheck();
  const [schools, setSchools] = useState<string[]>([]); // State for schools

  // Fetch list of schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/listofschools',
          })
        );

        // Assuming response.schools contains the list of school names
        if (response.schools) {
          setSchools(response.schools);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, []);

  // Handle school change
  const handleSchoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSchool = event.target.value;
    window.location.href = `/schooldatagraph?school=${encodeURIComponent(
      selectedSchool
    )}`;
  };

  return (
    <div
      className="school-selector"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
        textAlign: 'center',
        backgroundColor: '#fbf9f1', // Set background color to light beige
      }}
    >
      <div>
        <h3>Select a School to View Detailed Dashboard for Each Institution</h3>
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
      </div>
    </div>
  );
}

export default SchoolsList;
