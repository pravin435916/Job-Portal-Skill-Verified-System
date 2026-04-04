// components/JobDetails.jsx
import React from "react";
import CandidateCard from "./CandidateCard";

const JobDetails = ({ job }) => {
  if (!job) return <p>Select a job</p>;

  // Dummy candidates (replace later with API)
  const candidates = [
    { name: "Pravin Patil", email: "pravin@gmail.com", score: 72, skills: ["react", "mongodb"] },
    { name: "Prathmesh", email: "prathmesh@gmail.com", score: 19, skills: ["react"] },
    { name: "Rahul", email: "rahul@gmail.com", score: 5, skills: ["mongodb"] },
  ];

  return (
    <div className="job-details">
      <h2>{job.title}</h2>
      <p>{job.location}</p>

      <div className="candidate-list">
        {candidates.map((c, i) => (
          <CandidateCard key={i} c={c} index={i} />
        ))}
      </div>
    </div>
  );
};

export default JobDetails;