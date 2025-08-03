import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { TrendingUp, Target, Users, Calculator, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", isLoading = false }) => {
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
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {subtitle && !isLoading && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-8 h-8 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingCard = ({ title, icon: Icon }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Calculating...</span>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
);

const ProbabilityDashboard = ({ analysis, playerCount, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Probability Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Win Probability"
            value="..."
            subtitle="Calculating..."
            icon={TrendingUp}
            color="green"
            isLoading={true}
          />
          <StatCard
            title="Tie Probability" 
            value="..."
            subtitle="Calculating..."
            icon={Target}
            color="yellow"
            isLoading={true}
          />
          <StatCard
            title="Lose Probability"
            value="..."
            subtitle="Calculating..."
            icon={Users}
            color="red"
            isLoading={true}
          />
        </div>

        {/* Loading Cards */}
        <LoadingCard title="Hand Strength Analysis" icon={Target} />
        <LoadingCard title="Strategic Recommendation" icon={CheckCircle} />
        <LoadingCard title={`Opponent Range Analysis (${playerCount - 1} opponents)`} icon={Users} />
        <LoadingCard title="Calculation Details" icon={Calculator} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select your hole cards to begin analysis</p>
            <p className="text-xs mt-2 opacity-75">Powered by Monte Carlo simulations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRecommendationIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('fold')) return XCircle;
    if (actionLower.includes('check') || actionLower.includes('call')) return AlertCircle;
    if (actionLower.includes('bet') || actionLower.includes('raise') || actionLower.includes('all-in')) return CheckCircle;
    return AlertCircle;
  };

  const getRecommendationColor = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('fold')) return 'red';
    if (actionLower.includes('check') || actionLower.includes('call')) return 'yellow';
    if (actionLower.includes('bet') || actionLower.includes('raise') || actionLower.includes('all-in')) return 'green';
    return 'blue';
  };

  return (
    <div className="space-y-6">
      {/* Probability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Win Probability"
          value={`${analysis.win_probability?.toFixed(1) || '0.0'}%`}
          subtitle="Chance to win at showdown"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Tie Probability" 
          value={`${analysis.tie_probability?.toFixed(1) || '0.0'}%`}
          subtitle="Chance of split pot"
          icon={Target}
          color="yellow"
        />
        <StatCard
          title="Lose Probability"
          value={`${analysis.lose_probability?.toFixed(1) || '0.0'}%`}
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
                {analysis.hand_strength?.name || 'Unknown'}
              </Badge>
            </div>
            <p className="text-gray-600">{analysis.hand_strength?.description || 'No description available'}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hand Strength</span>
                <span>{analysis.hand_strength?.strength || 0}/9</span>
              </div>
              <Progress 
                value={((analysis.hand_strength?.strength || 0) / 9) * 100} 
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
            {React.createElement(
              getRecommendationIcon(analysis.recommendation?.action || ''), 
              { className: "w-5 h-5" }
            )}
            Strategic Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${
                  getRecommendationColor(analysis.recommendation?.action || '') === 'green' ? 'bg-green-100 text-green-800' :
                  getRecommendationColor(analysis.recommendation?.action || '') === 'red' ? 'bg-red-100 text-red-800' :
                  getRecommendationColor(analysis.recommendation?.action || '') === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {analysis.recommendation?.action || 'Unknown'}
              </Badge>
              <span className="text-sm text-gray-500">
                Confidence: {analysis.recommendation?.confidence || 'N/A'}
              </span>
            </div>
            <p className="text-gray-700">{analysis.recommendation?.reason || 'No recommendation available'}</p>
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
            {analysis.opponent_ranges?.slice(0, playerCount - 1).map((opponent, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Player {index + 1}</span>
                  <Badge variant="secondary">{opponent.profile}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Range:</span> {opponent.range}</p>
                  <p><span className="font-medium">Likely holdings:</span> {opponent.likely_holdings?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No opponent range data available</p>
            )}
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
              <span className="font-medium">{analysis.calculations?.method || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence Interval:</span>
              <span className="font-medium">{analysis.calculations?.confidence || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Cards Remaining:</span>
              <span className="font-medium">{analysis.calculations?.cards_remaining || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Calculation Time:</span>
              <span className="font-medium">{analysis.calculations?.simulation_time_ms || 0}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProbabilityDashboard;