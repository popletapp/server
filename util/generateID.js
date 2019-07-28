export default (currentTime = Date.now()) => {
  // ID's in Poplet are generated similarly to Twitter's "snowflakes"
  // The formula is [the current time] - [Poplet epoch] + [random integer between 1000 and 10,000]

  const POPLET_EPOCH = 1561903200000; // The Poplet epoch is the 1st of July, 2019 (AEST)
  const randomInteger = Math.floor(Math.random() * (1e4 - 1e3 + 1) + 1e3);

  return ((currentTime - POPLET_EPOCH) + randomInteger).toString();
}