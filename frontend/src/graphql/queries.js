import { gql } from '@apollo/client'

// GraphQL doesn't support recursive fragments natively, so we inline
// the recursion explicitly to four levels — enough for any UofT chain.
const COURSE_FIELDS = gql`
  fragment CourseFields on CourseType {
    code
    name
    description
    prerequisites {
      code
      name
      description
      prerequisites {
        code
        name
        description
        prerequisites {
          code
          name
          description
          prerequisites {
            code
            name
            description
          }
        }
      }
    }
  }
`

export const GET_COURSE = gql`
  ${COURSE_FIELDS}
  query GetCourse($code: String!) {
    course(code: $code) {
      ...CourseFields
    }
  }
`

export const SEARCH_COURSES = gql`
  query SearchCourses($search: String!) {
    courses(search: $search) {
      code
      name
    }
  }
`
