from .auth import RegisterView, LoginView
from .challenge import ChallengeView, ChallengeParticipantViewSet
from .content import EducationalContentViewSet
from .exercise import ExerciseViewSet
from .food import FoodViewSet
from .goal import GoalViewSet
from .fitness_plan import FitnessPlanViewSet, FitnessPlanUserViewSet, FitnessPlanExerciseViewSet 
from .meal_plan import MealPlanViewSet, MealPlanUserViewSet, MealFoodViewSet
from .subscription import SubscriptionViewSet
from .user import UserViewSet, InstructorViewSet, user_profile, instructor_dashboard, client_details, assigned_instructors
from .dashboard import dashboard
from .chat import MessageListCreateView, MessageMarkAsReadView, ConversationListView


__all__ = [
    'RegisterView', 'LoginView',
    'ChallengeView', 'ChallengeParticipantViewSet',
    'EducationalContentViewSet',
    'ExerciseViewSet',
    'FoodViewSet',
    'GoalViewSet',
    'FitnessPlanViewSet', 'FitnessPlanUserViewSet', 'FitnessPlanExerciseViewSet',
    'MealPlanViewSet', 'MealPlanUserViewSet', 'MealFoodViewSet',
    'SubscriptionViewSet',
    'UserViewSet', 'InstructorViewSet', 'user_profile', 
    'instructor_dashboard', 'client_details', 'assigned_instructors',
    'MessageListCreateView', 'MessageMarkAsReadView', 'ConversationListView',
    'dashboard',
]