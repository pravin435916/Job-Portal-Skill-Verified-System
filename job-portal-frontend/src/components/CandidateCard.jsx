// components/CandidateCard.jsx
import React from "react";

const CandidateCard = ({ c, index }) => {
  return (
    <div className="candidate-card">
      <div className="left">
        <h4>#{index + 1} {c.name}</h4>
        <p>{c.email}</p>

        <div className="skills">
          {c.skills.map((s, i) => (
            <span key={i} className={c.score > 50 ? "good" : "bad"}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className={`score ${c.score > 50 ? "green" : "red"}`}>
        {c.score}
      </div>
    </div>
  );
};

export default CandidateCard;