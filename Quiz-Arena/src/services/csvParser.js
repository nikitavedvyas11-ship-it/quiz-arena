// CSV Parsing and Validation Service for Quiz Battle

export const parseQuizCSV = (csvText) => {
  const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      validQuestions: [],
      errors: ['CSV file is empty or missing headers.'],
      totalParsed: 0
    };
  }

  // Parse header line to determine column positions
  const headerRow = parseCSVLine(lines[0]);
  const headers = headerRow.map(h => h.trim().toLowerCase());

  // Map expected column names
  const getColIndex = (names) => {
    return headers.findIndex(h => names.some(n => h.includes(n)));
  };

  const qIdx = getColIndex(['question', 'prompt', 'title']);
  const opt1Idx = getColIndex(['option 1', 'option1', 'choice 1', 'choice1', 'opt1', 'a']);
  const opt2Idx = getColIndex(['option 2', 'option2', 'choice 2', 'choice2', 'opt2', 'b']);
  const opt3Idx = getColIndex(['option 3', 'option3', 'choice 3', 'choice3', 'opt3', 'c']);
  const opt4Idx = getColIndex(['option 4', 'option4', 'choice 4', 'choice4', 'opt4', 'd']);
  const correctIdx = getColIndex(['correct answer', 'correct', 'answer', 'correctindex']);
  const timerIdx = getColIndex(['timer', 'time', 'timelimit']);
  const pointsIdx = getColIndex(['points', 'score']);
  const diffIdx = getColIndex(['difficulty', 'diff', 'level']);

  const validQuestions = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const row = parseCSVLine(lines[i]);
    if (row.length === 0 || row.every(cell => !cell.trim())) continue;

    const questionText = row[qIdx] ? row[qIdx].trim() : '';
    const opt1 = row[opt1Idx] ? row[opt1Idx].trim() : '';
    const opt2 = row[opt2Idx] ? row[opt2Idx].trim() : '';
    const opt3 = row[opt3Idx] ? row[opt3Idx].trim() : '';
    const opt4 = row[opt4Idx] ? row[opt4Idx].trim() : '';
    const correctRaw = row[correctIdx] ? row[correctIdx].trim() : '';
    const timerRaw = timerIdx !== -1 && row[timerIdx] ? parseInt(row[timerIdx], 10) : 20;
    const pointsRaw = pointsIdx !== -1 && row[pointsIdx] ? parseInt(row[pointsIdx], 10) : 1000;
    const diffRaw = diffIdx !== -1 && row[diffIdx] ? row[diffIdx].trim() : 'Medium';

    // Validation checks
    if (!questionText) {
      errors.push(`Row ${rowNum}: Question text is missing.`);
      continue;
    }
    if (!opt1 || !opt2) {
      errors.push(`Row ${rowNum}: Needs at least Option 1 and Option 2.`);
      continue;
    }

    const options = [opt1, opt2, opt3 || 'Option C', opt4 || 'Option D'];

    // Determine correct index (supports numbers 1-4, 0-3, A-D, or exact option text match)
    let correctIndex = 0;
    if (correctRaw) {
      const lowerCorrect = correctRaw.toLowerCase();
      if (['1', 'a', 'option 1', 'option a'].includes(lowerCorrect)) correctIndex = 0;
      else if (['2', 'b', 'option 2', 'option b'].includes(lowerCorrect)) correctIndex = 1;
      else if (['3', 'c', 'option 3', 'option c'].includes(lowerCorrect)) correctIndex = 2;
      else if (['4', 'd', 'option 4', 'option d'].includes(lowerCorrect)) correctIndex = 3;
      else {
        const foundIdx = options.findIndex(opt => opt.toLowerCase() === lowerCorrect);
        if (foundIdx !== -1) correctIndex = foundIdx;
        else {
          const parsedNum = parseInt(correctRaw, 10);
          if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 4) {
            correctIndex = parsedNum - 1;
          }
        }
      }
    }

    const timer = !isNaN(timerRaw) && timerRaw >= 5 ? timerRaw : 20;
    const points = !isNaN(pointsRaw) ? pointsRaw : 1000;
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(diffRaw) ? diffRaw : 'Medium';

    validQuestions.push({
      id: `q-csv-${Date.now()}-${i}`,
      text: questionText,
      type: 'multiple',
      timeLimit: timer,
      options,
      correctIndex,
      points,
      difficulty
    });
  }

  return {
    validQuestions,
    errors,
    totalParsed: lines.length - 1
  };
};

// Helper: Standard CSV Row Splitter supporting quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}