from django.contrib import admin
from django.urls import path
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('admin/', admin.site.urls),
    # GraphQL endpoint — csrf_exempt so Apollo can POST without a CSRF token.
    # graphiql=True enables the in-browser explorer at http://localhost:8000/graphql/
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
]
