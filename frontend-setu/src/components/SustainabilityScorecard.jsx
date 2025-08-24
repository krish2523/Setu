// src/components/SustainabilityScorecard.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "../styles/SustainabilityScorecard.css";

// --- Scoring Logic ---
const calculateImpactScores = (completedReports) => {
  const scores = {
    climate: 0, // Formerly SDG 13
    water: 0, // Formerly SDG 14
    land: 0, // Formerly SDG 15
  };

  if (!completedReports || completedReports.length === 0) {
    return scores;
  }

  let deforestationCount = 0;
  let garbageCount = 0;

  completedReports.forEach((report) => {
    if (report.category === "Deforestation") {
      deforestationCount++;
    }
    if (report.category === "Garbage") {
      garbageCount++;
    }
  });

  // Simple scoring: 10 points per relevant completed task, capped at 100.
  scores.climate = Math.min(deforestationCount * 10, 100);
  scores.water = Math.min(garbageCount * 10, 100);
  scores.land = Math.min((garbageCount + deforestationCount) * 5, 100);

  return scores;
};

// --- Main Component ---
const SustainabilityScorecard = ({ completedReports }) => {
  const scores = calculateImpactScores(completedReports);

  const data = [
    { name: "Climate Action", score: scores.climate, color: "#d97706" },
    { name: "Water Quality", score: scores.water, color: "#2563eb" },
    { name: "Land Health", score: scores.land, color: "#16a34a" },
  ];

  const totalScore = (scores.climate + scores.water + scores.land) / 3;

  return (
    <div className="scorecard-container">
      <div className="scorecard-header">
        <h3>Sustainability Impact Scorecard</h3>
        <p>Your NGO's contribution towards key environmental goals.</p>
      </div>
      <div className="scorecard-content">
        <div className="scorecard-chart">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #f1f5f9",
                }}
              />
              <Bar dataKey="score" barSize={25} radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="scorecard-summary">
          <p className="summary-label">Overall Impact Score</p>
          <p className="summary-score">{totalScore.toFixed(1)}</p>
          <p className="summary-footer">
            Based on {completedReports.length} completed tasks
          </p>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScorecard;





