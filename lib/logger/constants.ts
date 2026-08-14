export const LOGGER_ENVIRONMENTS = ["production", "preprod", "gk"] as const;

export type LoggerEnvironment = (typeof LOGGER_ENVIRONMENTS)[number];

export type LoggerLink = {
  label: string;
  href: string;
  environment: LoggerEnvironment;
};

export const LOGGER_ENV_TOKEN: Record<LoggerEnvironment, string> = {
  production: "PROD",
  preprod: "PREPROD",
  gk: "GK",
};

const LOGGER_ENV_PRIORITY = new Map(
  LOGGER_ENVIRONMENTS.map((environment, index) => [environment, index]),
);

function sortLoggerLinksByEnvironment(links: LoggerLink[]): LoggerLink[] {
  return links.toSorted(
    (a, b) =>
      (LOGGER_ENV_PRIORITY.get(a.environment) ?? 0) -
      (LOGGER_ENV_PRIORITY.get(b.environment) ?? 0),
  );
}

/** Dummy destinations. Replace hrefs with real logger URLs. */
export const LOGGER_LINKS: LoggerLink[] = sortLoggerLinksByEnvironment([
  {
    label: "Kibana Logs - TIX-NEXT-PAYMENT-FE",
    href: "https://prod-grafana-payment-logging.ggwp.red/explore?schemaVersion=1&panes=%7B%22zgu%22:%7B%22datasource%22:%22afr2xua7vjfggc%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22victoriametrics-logs-datasource%22,%22uid%22:%22afr2xua7vjfggc%22%7D,%22editorMode%22:%22code%22,%22expr%22:%22resources.env:%5C%22production%5C%22%20AND%20resources.service:%5C%22next-payment-fe%5C%22%22,%22queryType%22:%22range%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1&var-environment=production,production&var-service_name=next-payment-fe,next-payment-fe&var-count_by=$%7Bcount_by:text%7D&var-group_by=$%7Bgroup_by:text%7D&var-filter=",
    environment: "production",
  },
  {
    label: "Kibana Logs -  TIX-NEXT-PAYMENT-FE",
    href: "https://arjuna.kepo.ninja/explore?schemaVersion=1&panes=%7B%2212p%22%3A%7B%22datasource%22%3A%22ffbzqc7wvzwu8f%22%2C%22queries%22%3A%5B%7B%22refId%22%3A%22A%22%2C%22datasource%22%3A%7B%22type%22%3A%22victoriametrics-logs-datasource%22%2C%22uid%22%3A%22ffbzqc7wvzwu8f%22%7D%2C%22editorMode%22%3A%22code%22%2C%22expr%22%3A%22resources.env%3A+%5C%22preprod%5C%22+AND+resources.service%3A+%5C%22next-payment-fe%5C%22+AND+sdc.isConsumerFe%3A+true%22%2C%22queryType%22%3A%22instant%22%2C%22legendFormat%22%3A%22%22%7D%5D%2C%22range%22%3A%7B%22from%22%3A%22now-1h%22%2C%22to%22%3A%22now%22%7D%7D%7D&orgId=1",
    environment: "preprod",
  },
  {
    label: "Kibana Logs -  TIX-NEXT-PAYMENT-FE",
    href: "https://arjuna.kepo.ninja/explore?schemaVersion=1&panes=%7B%2212p%22:%7B%22datasource%22:%22ffbzqc7wvzwu8f%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22victoriametrics-logs-datasource%22,%22uid%22:%22ffbzqc7wvzwu8f%22%7D,%22editorMode%22:%22builder%22,%22expr%22:%22resources.env:%20%5C%22testing%5C%22%20AND%20resources.service:%20%5C%22next-payment-fe%5C%22%20AND%20sdc.isConsumerFe:%20true%22,%22queryType%22:%22instant%22,%22legendFormat%22:%22%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1",
    environment: "gk",
  },
  {
    label: "kubernetes-react-details",
    href: "https://kotaro.kepo.ninja/d/kubernetes-react-details/kubernetes-react-details?orgId=1&var-env=prod&var-service_group=payment&var-service_name=next-payment-fe&refresh=30s&var-kube_namespace=next-payment-fe-ns&var-pod_name=All&from=now-5m&to=now",
    environment: "production",
  },
  {
    label: "deployment-details",
    href: "https://kotaro.kepo.ninja/d/deployment-details/deployment-details?orgId=1&refresh=10s&var-cluster_name=prod-payment&var-Deployment=All&var-service=All&var-ingress=All&from=now-15m&to=now&var-Namespace=next-payment-fe-ns",
    environment: "production",
  },
]);
