import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDBClient({});

const questions = [
    // A1 Questions
    {
        PK: 'CEFR#A1',
        SK: 'QUESTION#001',
        QuestionText: 'What is the color of the sky?',
        Options: [
            { text: 'Blue', isCorrect: true },
            { text: 'Green', isCorrect: false },
            { text: 'Red', isCorrect: false },
            { text: 'Yellow', isCorrect: false },
        ],
        CorrectOption: 'Blue',
        CEFRLevel: 'A1',
    },
    {
        PK: 'CEFR#A1',
        SK: 'QUESTION#002',
        QuestionText: 'What is the color of the sun?',
        Options: [
            { text: 'Blue', isCorrect: false },
            { text: 'Green', isCorrect: false },
            { text: 'Red', isCorrect: false },
            { text: 'Yellow', isCorrect: true },
        ],
        CorrectOption: 'Yellow',
        CEFRLevel: 'A1',
    },
    {
        PK: 'CEFR#A1',
        SK: 'QUESTION#003',
        QuestionText: 'What is your name?',
        Options: [
            { text: 'I am fine', isCorrect: false },
            { text: 'I am [Your Name]', isCorrect: true },
            { text: 'It is sunny', isCorrect: false },
            { text: 'I like apples', isCorrect: false },
        ],
        CorrectOption: 'I am [Your Name]',
        CEFRLevel: 'A1',
    },
    {
        PK: 'CEFR#A1',
        SK: 'QUESTION#004',
        QuestionText: 'How many legs does a dog have?',
        Options: [
            { text: 'Two', isCorrect: false },
            { text: 'Four', isCorrect: true },
            { text: 'Six', isCorrect: false },
            { text: 'Eight', isCorrect: false },
        ],
        CorrectOption: 'Four',
        CEFRLevel: 'A1',
    },

    // A2 Questions
    {
        PK: 'CEFR#A2',
        SK: 'QUESTION#001',
        QuestionText: 'What do you usually eat for breakfast?',
        Options: [
            { text: 'At night', isCorrect: false },
            { text: 'Breakfast foods', isCorrect: true },
            { text: 'In the morning', isCorrect: false },
            { text: 'By the table', isCorrect: false },
        ],
        CorrectOption: 'Breakfast foods',
        CEFRLevel: 'A2',
    },
    {
        PK: 'CEFR#A2',
        SK: 'QUESTION#002',
        QuestionText: 'Where is the nearest train station?',
        Options: [
            { text: 'It is close to my house', isCorrect: true },
            { text: 'I am running', isCorrect: false },
            { text: 'The train is yellow', isCorrect: false },
            { text: 'It is green', isCorrect: false },
        ],
        CorrectOption: 'It is close to my house',
        CEFRLevel: 'A2',
    },
    {
        PK: 'CEFR#A2',
        SK: 'QUESTION#003',
        QuestionText: 'What time do you usually wake up?',
        Options: [
            { text: 'At seven in the morning', isCorrect: true },
            { text: 'I eat cereal', isCorrect: false },
            { text: 'To the train station', isCorrect: false },
            { text: 'Blue is my favorite color', isCorrect: false },
        ],
        CorrectOption: 'At seven in the morning',
        CEFRLevel: 'A2',
    },

    // B1 Questions
    {
        PK: 'CEFR#B1',
        SK: 'QUESTION#001',
        QuestionText: 'Why is it important to eat healthy food?',
        Options: [
            { text: 'It tastes good', isCorrect: false },
            { text: 'It helps your body stay strong', isCorrect: true },
            { text: 'It is fun to cook', isCorrect: false },
            { text: 'It is expensive', isCorrect: false },
        ],
        CorrectOption: 'It helps your body stay strong',
        CEFRLevel: 'B1',
    },
    {
        PK: 'CEFR#B1',
        SK: 'QUESTION#002',
        QuestionText: 'What are the advantages of learning a new language?',
        Options: [
            { text: 'It is easy', isCorrect: false },
            { text: 'You can talk to more people', isCorrect: true },
            { text: 'It is boring', isCorrect: false },
            { text: 'You don’t need to travel', isCorrect: false },
        ],
        CorrectOption: 'You can talk to more people',
        CEFRLevel: 'B1',
    },

    // B2 Questions
    {
        PK: 'CEFR#B2',
        SK: 'QUESTION#001',
        QuestionText: 'How do you think technology has changed communication?',
        Options: [
            { text: 'We write fewer letters now', isCorrect: true },
            { text: 'It has not changed', isCorrect: false },
            { text: 'People read more books', isCorrect: false },
            { text: 'We have more time', isCorrect: false },
        ],
        CorrectOption: 'We write fewer letters now',
        CEFRLevel: 'B2',
    },
    {
        PK: 'CEFR#B2',
        SK: 'QUESTION#002',
        QuestionText: 'What are the main challenges of living in a foreign country?',
        Options: [
            { text: 'Learning the language and culture', isCorrect: true },
            { text: 'Buying a plane ticket', isCorrect: false },
            { text: 'Finding the capital city', isCorrect: false },
            { text: 'It is easy to adapt', isCorrect: false },
        ],
        CorrectOption: 'Learning the language and culture',
        CEFRLevel: 'B2',
    },

    // C1 Questions
    {
        PK: 'CEFR#C1',
        SK: 'QUESTION#001',
        QuestionText: 'How would you explain the impact of globalization on local cultures?',
        Options: [
            { text: 'Globalization has no impact', isCorrect: false },
            { text: 'Local traditions may change due to external influences', isCorrect: true },
            { text: 'It makes cultures stronger', isCorrect: false },
            { text: 'There is no effect on language', isCorrect: false },
        ],
        CorrectOption: 'Local traditions may change due to external influences',
        CEFRLevel: 'C1',
    },
    {
        PK: 'CEFR#C1',
        SK: 'QUESTION#002',
        QuestionText: 'What are the benefits of renewable energy over fossil fuels?',
        Options: [
            { text: 'It is more harmful to the environment', isCorrect: false },
            { text: 'It is sustainable and eco-friendly', isCorrect: true },
            { text: 'It costs less money', isCorrect: false },
            { text: 'It is harder to produce', isCorrect: false },
        ],
        CorrectOption: 'It is sustainable and eco-friendly',
        CEFRLevel: 'C1',
    },

    // C2 Questions
    {
        PK: 'CEFR#C2',
        SK: 'QUESTION#001',
        QuestionText: 'To what extent do you agree that artificial intelligence will replace most human jobs?',
        Options: [
            { text: 'Completely disagree', isCorrect: false },
            { text: 'It is highly probable for repetitive tasks', isCorrect: true },
            { text: 'There will be no change in job trends', isCorrect: false },
            { text: 'Humans are irreplaceable in all jobs', isCorrect: false },
        ],
        CorrectOption: 'It is highly probable for repetitive tasks',
        CEFRLevel: 'C2',
    },
    {
        PK: 'CEFR#C2',
        SK: 'QUESTION#002',
        QuestionText: 'What role does ethics play in scientific research?',
        Options: [
            { text: 'Ethics limits progress', isCorrect: false },
            { text: 'It ensures the well-being of humanity', isCorrect: true },
            { text: 'It is unnecessary for research', isCorrect: false },
            { text: 'It speeds up discoveries', isCorrect: false },
        ],
        CorrectOption: 'It ensures the well-being of humanity',
        CEFRLevel: 'C2',
    }
];

const cefrQuestionsTableName = process.env.cefrQuestionsTableName;

export const handler = async () => {
    try {
        for (const question of questions) {
            const putCommand = new PutCommand({
                TableName: cefrQuestionsTableName,
                Item: question,
            });

            await dynamoDb.send(putCommand);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Questions added successfully' }),
        };
    } catch (error) {
        console.error('Error adding questions:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to add questions' }),
        };
    }
};