import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingUp, Target, Users, Calculator, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200", 
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200"
  };

  return (
    <Card className={`${colorClasses[color]} border-2 transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-8 h-8 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
};

const ProbabilityDashboard = ({ analysis, playerCount }) => {
  if (!analysis) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select your hole cards to begin analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRecommendationIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'fold': return XCircle;
      case 'check/call': return AlertCircle;
      case 'bet/raise': 
      case 'all-in': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getRecommendationColor = (action) => {
    switch (action.toLowerCase()) {
      case 'fold': return 'red';
      case 'check/call': return 'yellow';
      case 'bet/raise':
      case 'all-in': return 'green';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Probability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Win Probability"
          value={`${analysis.winProbability.toFixed(1)}%`}
          subtitle="Chance to win at showdown"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Tie Probability" 
          value={`${analysis.tieProbability.toFixed(1)}%`}
          subtitle="Chance of split pot"
          icon={Target}
          color="yellow"
        />
        <StatCard
          title="Lose Probability"
          value={`${analysis.loseProbability.toFixed(1)}%`}
          subtitle="Chance opponents win"
          icon={Users}
          color="red"
        />
      </div>

      {/* Hand Strength Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Hand Strength Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Current Hand:</span>
              <Badge variant="outline" className="text-lg">
                {analysis.handStrength.name}
              </Badge>
            </div>
            <p className="text-gray-600">{analysis.handStrength.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hand Strength</span>
                <span>{analysis.handStrength.strength}/9</span>
              </div>
              <Progress 
                value={(analysis.handStrength.strength / 9) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(getRecommendationIcon(analysis.recommendation.action), { className: "w-5 h-5" })}
            Strategic Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${
                  getRecommendationColor(analysis.recommendation.action) === 'green' ? 'bg-green-100 text-green-800' :
                  getRecommendationColor(analysis.recommendation.action) === 'red' ? 'bg-red-100 text-red-800' :
                  getRecommendationColor(analysis.recommendation.action) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {analysis.recommendation.action}
              </Badge>
              <span className="text-sm text-gray-500">
                Confidence: {analysis.recommendation.confidence}
              </span>
            </div>
            <p className="text-gray-700">{analysis.recommendation.reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Opponent Range Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Opponent Range Analysis ({playerCount - 1} opponents)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.opponentRanges.slice(0, playerCount - 1).map((opponent, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Player {index + 1}</span>
                  <Badge variant="secondary">{opponent.profile}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Range:</span> {opponent.range}</p>
                  <p><span className="font-medium">Likely holdings:</span> {opponent.likelyHoldings.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-medium">{analysis.calculations.method}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence Interval:</span>
              <span className="font-medium">{analysis.calculations.confidence}</span>
            </div>
            <div className="flex justify-between">
              <span>Cards Remaining:</span>
              <span className="font-medium">{analysis.calculations.cardsRemaining}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProbabilityDashboard;