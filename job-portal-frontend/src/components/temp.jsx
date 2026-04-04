// components/Sidebar.jsx
import React from "react";

const Sidebar = ({ jobs, selected, setSelected }) => {
  return (
    <div className="sidebar">
      <h3>YOUR JOBS</h3>

      {jobs.map((job) => (
        <div
          key={job.job_id}
          className={`job-card ${selected?.job_id === job.job_id ? "active" : ""}`}
          onClick={() => setSelected(job)}
        >
          <h4>{job.title}</h4>
          <p>{job.location}</p>

          <div className="skills">
            {job.required_skills.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;