// pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/temp";
import JobDetails from "../components/JobDetails";
import { getMyJobs } from "../services/api";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.data);
      setSelected(res.data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      <Sidebar jobs={jobs} selected={selected} setSelected={setSelected} />
      <JobDetails job={selected} />
    </div>
  );
};

export default Dashboard;