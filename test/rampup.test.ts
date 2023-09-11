
import { rampUp } from "../src/rampUp";  // Adjust the path to point to your main script file

const gitURL0 = "https://github.com/rvchit/test0";
const gitURLmiddle = "https://github.com/cloudinary/cloudinary_npm";
const gitURL1 = "https://github.com/tj/commander.js";


test('it should return a score of 0 for a repository with no README', async () => {
  const score = await rampUp(gitURL0);  
  expect(score).toBe(0);
});

test('it should return a score of 0.744 for a repository with a README and some keywords', async () => {
    const score = await rampUp(gitURLmiddle);  
    expect(score).toBe(0.744);
  });

  test('it should return a score of 1 for a repository with no README', async () => {
    const score = await rampUp(gitURL1);  
    expect(score).toBe(1);
  });
