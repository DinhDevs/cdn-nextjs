/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "cdn-nextjs",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-1",
        },
      },
    };
  },
  async run() {
    const s3Bucket = new sst.aws.Bucket("CdnNextjsBucket", {
      public: true,
    });
    const router = new sst.aws.Router("CdnNextjsRouter", {
      routes: {
        "/*": s3Bucket.nodes.bucket.bucketDomainName.apply((domain) => {
          return `https://${domain}`;
        }),
      },
    });

    new sst.aws.Nextjs("CdnNextjs", {
      link: [s3Bucket],
      environment: {
        NEXT_PUBLIC_BUCKET_URL: s3Bucket.nodes.bucket.bucketDomainName.apply(
          (domain) => {
            return `https://${domain}`;
          }
        ),
        NEXT_PUBLIC_CLOUD_FRONT_URL: router.url,
      },
    });
  },
});
