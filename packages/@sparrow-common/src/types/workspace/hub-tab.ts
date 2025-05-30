export interface IdWrapper2 {}

export interface UserDetailsWrapper {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IdWrapper {
  id: string;
}
export interface NameWrapper {
  name: string;
}
export interface DescriptionWrapper {
  description: string;
}

export interface HubUrlWrapper {
  hubUrl: string;
}
export interface GithubUrlWrapper {
  githubUrl: string;
}
export interface XUrlWrapper {
  xUrl: string;
}
export interface LinkedinUrlWrapper {
  linkedinUrl: string;
}
export interface LogoWrapper {
  logo: object;
}
export interface OwnerWrapper {
  owner: string;
}
export interface UsersWrapper {
  users: UserDetailsWrapper[];
}
export interface CreatedAtWrapper {
  createdAt: string;
}
export interface CreatedByWrapper {
  createdBy: string;
}
export interface UpdatedAtWrapper {
  updatedAt: string;
}
export interface UpdatedByWrapper {
  updatedBy: string;
}
export interface Hub
  extends IdWrapper,
    NameWrapper,
    DescriptionWrapper,
    LogoWrapper,
    LinkedinUrlWrapper,
    GithubUrlWrapper,
    XUrlWrapper,
    HubUrlWrapper,
    OwnerWrapper,
    UsersWrapper,
    CreatedAtWrapper,
    CreatedByWrapper,
    UpdatedAtWrapper,
    UpdatedByWrapper {}

export interface HubWrapper {
  hub: Hub;
}

export interface Property extends HubWrapper {}

export interface PropertyWrapper {
  property: Property;
}
