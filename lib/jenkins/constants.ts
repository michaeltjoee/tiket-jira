export const JENKINS_ENVIRONMENTS = ["production", "preprod", "gk"] as const;

export type JenkinsEnvironment = (typeof JENKINS_ENVIRONMENTS)[number];

export type JenkinsLink = {
  label: string;
  href: string;
  environment: JenkinsEnvironment;
};

export const JENKINS_ENV_TOKEN: Record<JenkinsEnvironment, string> = {
  production: "PROD",
  preprod: "PREPROD",
  gk: "GK",
};

/** Dummy destinations. Replace hrefs with real Jenkins job URLs. */
export const JENKINS_LINKS: JenkinsLink[] = [
  {
    label: "TIX-NEXT-PAYMENT-FE",
    href: "https://gk-k8s-jenkins.ggwp.red/job/PLATFORM/job/TIX-NEXT-PAYMENT-FE/build?delay=0sec",
    environment: "gk",
  },
];
