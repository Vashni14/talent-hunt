import React from "react";
import TeammateCard from "./TeammateCard";

const MatchingModal = ({ matchedTeammates, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-teal-400">
            Your Best Matches
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">
          These teammates have skills that complement yours based on our matching algorithm.
        </p>

        {matchedTeammates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchedTeammates.map((teammate) => (
              <TeammateCard 
                key={teammate._id} 
                teammate={teammate} 
                isMatch={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-lg">
              No matches found at this time. Try adjusting your profile skills.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingModal;