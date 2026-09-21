// Exact sentence patterns that should be reordered before signing.
// Inputs are normalized for case, punctuation, and repeated whitespace.
const SENTENCE_PATTERNS = {
  'do people understand your signs': ['PEOPLE', 'YOUR', 'SIGNS', 'UNDERSTAND'],
  'do you use signs every day': ['YOU', 'EVERYDAY', 'SIGNS', 'USE'],
  'do your friends use signs': ['YOUR', 'FRIENDS', 'SIGNS', 'USE'],
  'can people talk to you easily': ['PEOPLE', 'YOU', 'TO', 'EASILY', 'TALK'],
  'do you use signs at school': ['YOU', 'SCHOOL', 'AT', 'SIGNS', 'USE'],
  'is sign language easy for you': ['YOU', 'FOR', 'SIGN', 'LANGUAGE', 'EASY'],
  'is talking to new people hard': ['NEW', 'PEOPLE', 'TO', 'TALKING', 'HARD'],
  'do you need help to talk': ['YOU', 'TALK', 'TO', 'HELP', 'NEED'],
  'can a camera see your signs': ['A', 'CAMERA', 'YOUR', 'SIGNS', 'SEE'],
  'can signs become speech': ['SIGNS', 'SPEECH', 'BECOME'],
  'would that help you': ['THAT', 'YOU', 'HELP'],
  'do you like this idea': ['YOU', 'THIS', 'IDEA', 'LIKE'],
  'can you show us a sign': ['YOU', 'US', 'A', 'SIGN', 'USE'],
  'which sign do you use most': ['YOU', 'WHICH', 'SIGN', 'MOST', 'USE'],
  'can you try sambhav': ['YOU', 'SAMBHAV', 'TRY'],
  'how are you': ['YOU', 'HOW'],
  'what do you want': ['YOU', 'WHAT', 'WANT'],
  'what is your name': ['YOUR', 'NAME', 'WHAT', 'IS'],
  'I am fine': ['I', 'FINE']
};

export function normalizeSentence(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSentencePattern(value) {
  return SENTENCE_PATTERNS[normalizeSentence(value)] || null;
}

export { SENTENCE_PATTERNS };
