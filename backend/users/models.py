from django.contrib.auth import get_user_model

User = get_user_model()

# The project uses Django's default User model until product requirements justify
# a custom auth model.
