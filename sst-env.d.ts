/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    CdnNextjs: {
      type: "sst.aws.Nextjs"
      url: string
    }
    CdnNextjsBucket: {
      name: string
      type: "sst.aws.Bucket"
    }
    CdnNextjsRouter: {
      type: "sst.aws.Router"
      url: string
    }
  }
}
export {}