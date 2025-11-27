// MongoDB initialization script
db = db.getSiblingDB("gamification");

// Create collections
db.createCollection("appperm_assessments");
db.createCollection("phishing_assessments");
db.createCollection("password_assessments");
db.createCollection("social_assessments");
db.createCollection("safe_browsing_assessments");
db.createCollection("users");
db.createCollection("games");

print("MongoDB initialized with gamification database and collections");
