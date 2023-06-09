import { gql } from 'apollo-server-express';

/** A project definition. */
export const Project = gql`
  "Project record."
  type Project {
    "Unique ID of this project."
    id: ID!

    "Account that owns this project."
    owner: ID!
    "Denormalized owner name."
    ownerName: String!

    "Unique name of this project within an account."
    name: String!

    "Short description of the project."
    title: String!

    "A more detailed description of the project."
    description: String!

    "When this project was created."
    createdAt: DateTime!

    "When this project was last updated."
    updatedAt: DateTime!

    "Issue template for this project."
    template: String

    "If true, indicates that this project is visible to the public."
    isPublic: Boolean!

    "Role of current user with respect to this project."
    role: Int
  }

  "Data type for creating or updating a project."
  input ProjectInput {
    "Short description of the project."
    title: String!

    "A more detailed description of the project."
    description: String!

    "Issue template for this project."
    template: String

    "If true, indicates that this project is visible to the public."
    isPublic: Boolean!
  }

  "Query result that returns project, owner account and memberships in a single operation."
  type ProjectContext {
    "Project record"
    project: Project!

    "Account that owns the project"
    account: PublicAccount!

    "Current user's project preferences"
    prefs: ProjectPrefs!

    # Milestones

    "Templates for this project"
    template: JSONObject!
  }
`;
