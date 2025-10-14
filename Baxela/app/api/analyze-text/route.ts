import { NextRequest, NextResponse } from 'next/server';
import natural from 'natural';

const classifier = new natural.BayesClassifier();

// Train the classifier with some initial data
classifier.addDocument('money exchange votes payment bribe', 'vote_buying');
classifier.addDocument('intimidate threaten force coerce', 'intimidation');
classifier.addDocument('ballot box stuffing multiple votes', 'ballot_stuffing');
classifier.addDocument('change modify tamper alter', 'tampering');
classifier.addDocument('fake news false information misleading', 'misinformation');
classifier.train();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    // Classify the text
    const classification = classifier.classify(text);
    
    // Get confidence scores for each category
    const scores = classifier.getClassifications(text);
    
    return NextResponse.json({
      classification,
      confidence: scores[0].value,
      allScores: scores
    });
  } catch (error) {
    console.error('Text analysis error:', error);
    return NextResponse.json({ error: 'Text analysis failed' }, { status: 500 });
  }
}