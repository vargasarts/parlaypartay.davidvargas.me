const listAlgorithmsByUser = () => {
  return [
    {
      id: "1",
      label: "Coin Flipper",
      logic: "return Math.random() < 0.5",
    },
  ];
};

export default listAlgorithmsByUser;
