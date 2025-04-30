import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { BookOpen, AlertCircle, CheckCircle, XCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useDocumentStore } from '@/store/document-store';

const API_BASE_URL = Platform.OS === 'ios' 
  ? 'http://127.0.0.1:8000'
  : 'http://10.0.2.2:8000';

interface Question {
    id: number;
    question: string;
    choices: { [key: string]: string };
    correct_answer: string;
}

interface QuizResult {
    question_id: number;
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
}

export default function QuizScreen() {
    const { isDocumentUploaded } = useDocumentStore();
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isDocumentUploaded) {
        checkStatus();
        }
    }, [isDocumentUploaded]);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/status`);
            console.log('Status response:', response.data);
            if (response.data.indexed) {
                await fetchQuiz();
            } else {
                setError('Document not properly indexed. Please try uploading again.');
            }
        } catch (err) {
            console.error('Status check error:', err);
            setError('Failed to check document status');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuiz = async () => {
        try {
            console.log('Fetching quiz...');
            const response = await axios.post(`${API_BASE_URL}/generate-quiz`);
            console.log('Quiz response:', response.data);
            if (response.data.questions && response.data.questions.length > 0) {
            setQuestions(response.data.questions);
            } else {
                setError('No quiz questions were generated');
            }
        } catch (err) {
            console.error('Quiz generation error:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate quiz';
            setError(errorMessage);
        }
    };

    const checkAnswer = async (questionId: number, answer: string) => {
        try {
            console.log('Checking answer:', { questionId, answer });
            const response = await axios.post(`${API_BASE_URL}/check-answer`, {
                question_id: questionId,
                selected_answer: answer
            });
            console.log('Check answer response:', response.data);
            setResult(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to check answer';
            console.error('Answer check error:', {
                message: errorMessage,
                response: err.response?.data,
                status: err.response?.status,
                fullError: err
            });
            setError(errorMessage);
        }
    };

    const handleAnswerSelect = async (answer: string) => {
        if (selectedAnswer || loading) return;
        setSelectedAnswer(answer);
        await checkAnswer(questions[currentQuestionIndex].id, answer);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setResult(null);
        }
    };

    const renderQuestion = () => {
        const question = questions[currentQuestionIndex];
        return (
            <View style={styles.questionContainer}>
                <Card style={styles.questionCard}>
                    <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
                    <Text style={styles.questionText}>{question.question}</Text>
                    
                    <View style={styles.choicesContainer}>
                        {Object.entries(question.choices).map(([key, value]) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.choiceButton,
                                    selectedAnswer === key && styles.selectedChoice,
                                    result && key === result.correct_answer && styles.correctChoice,
                                    result && selectedAnswer === key && !result.is_correct && styles.incorrectChoice,
                                ]}
                                onPress={() => handleAnswerSelect(key)}
                                disabled={!!selectedAnswer}
                            >
                                <Text style={[
                                    styles.choiceText,
                                    selectedAnswer === key && styles.selectedChoiceText,
                                    result && key === result.correct_answer && styles.correctChoiceText,
                                    result && selectedAnswer === key && !result.is_correct && styles.incorrectChoiceText,
                                ]}>
                                    {key}. {value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {result && (
                        <View style={styles.resultContainer}>
                            <View style={styles.resultHeader}>
                                {result.is_correct ? (
                                    <CheckCircle size={24} color={colors.success} />
                                ) : (
                                    <XCircle size={24} color={colors.error} />
                                )}
                                <Text style={[
                                    styles.resultText,
                                    { color: result.is_correct ? colors.success : colors.error }
                                ]}>
                                    {result.is_correct ? 'Correct!' : 'Incorrect'}
                                </Text>
                            </View>
                            <Text style={styles.explanationText}>{result.explanation}</Text>
                        </View>
                    )}

                    {result && currentQuestionIndex < questions.length - 1 && (
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleNextQuestion}
                        >
                            <Text style={styles.nextButtonText}>Next Question</Text>
                        </TouchableOpacity>
                    )}
                </Card>
            </View>
        );
    };

    if (loading) {
        return (
            <ImageBackground 
                source={require('@/assets/images/image.png')} 
                style={styles.backgroundImage}
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>
                            Loading quiz...
                        </Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    if (!isDocumentUploaded) {
        return (
            <ImageBackground 
                source={require('@/assets/images/image.png')} 
                style={styles.backgroundImage}
            >
                <SafeAreaView style={styles.container}>
                    <EmptyState
                        title="No Document Available"
                        description="Upload a financial report to start the quiz."
                        icon={<BookOpen size={48} color={colors.primary} />}
                        actionLabel="Upload Report"
                        onAction={() => router.push('/')}
                    />
                </SafeAreaView>
            </ImageBackground>
        );
    }

    if (error) {
        return (
            <ImageBackground 
                source={require('@/assets/images/image.png')} 
                style={styles.backgroundImage}
            >
                <SafeAreaView style={styles.container}>
                    <EmptyState
                        title="Error Loading Quiz"
                        description={error}
                        icon={<AlertCircle size={48} color={colors.error} />}
                        actionLabel="Retry"
                        onAction={fetchQuiz}
                    />
                </SafeAreaView>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground 
            source={require('@/assets/images/image.png')} 
            style={styles.backgroundImage}
        >
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.pageTitle}>Financial Knowledge Quiz</Text>
                    {questions.length > 0 && renderQuestion()}
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.white,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 24,
        marginTop: 60,
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionCard: {
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    questionNumber: {
        fontSize: 14,
        color: colors.gray[400],
        marginBottom: 8,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.white,
        marginBottom: 20,
    },
    choicesContainer: {
        gap: 12,
    },
    choiceButton: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectedChoice: {
        backgroundColor: colors.primary + '33',
        borderColor: colors.primary,
    },
    correctChoice: {
        backgroundColor: colors.success + '33',
        borderColor: colors.success,
    },
    incorrectChoice: {
        backgroundColor: colors.error + '33',
        borderColor: colors.error,
    },
    choiceText: {
        fontSize: 16,
        color: colors.white,
    },
    selectedChoiceText: {
        color: colors.primary,
    },
    correctChoiceText: {
        color: colors.success,
    },
    incorrectChoiceText: {
        color: colors.error,
    },
    resultContainer: {
        marginTop: 20,
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    resultText: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    explanationText: {
        fontSize: 14,
        color: colors.white,
        lineHeight: 20,
    },
    nextButton: {
        marginTop: 20,
        padding: 16,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
