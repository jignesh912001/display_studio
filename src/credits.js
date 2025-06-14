import React from 'react';

// I know, it is unsafe to use sessionStorage
// but I don't want to add any backend for this right now
// and I don't want to use cookies
// so it is just a simple hack
// for prototype
// I promise to fix it later
// most of the text above wrote copilot
const loadCredits = (key, maxUsage) => {
  try {
    const data = JSON.parse(sessionStorage.getItem(key) || '{}');
    if (data.date !== new Date().toDateString()) {
      return maxUsage;
    }
    return data.credits || maxUsage;
  } catch (e) {}
  return maxUsage;
};

const saveCredits = (key, credits) => {
  sessionStorage.setItem(
    key,
    JSON.stringify({
      date: new Date().toDateString(),
      credits,
    })
  );
};

export const useCredits = (key = 'unknown', maxUsage = 10) => {
  const [credits, setCredits] = React.useState(() =>
    loadCredits(key, maxUsage)
  );

  React.useEffect(() => {
    saveCredits(key, credits);
  }, [key, credits]);

  const consumeCredits = (amount = 1) => {
    setCredits((credits) => credits - amount);
  };

  return { credits, consumeCredits };
};
