db.createUser(
  {
    user: "visualit",
    pwd: "password",
    roles: [
      {
        role: "readWrite",
        db: "visualit"
      }
    ]
  }
);