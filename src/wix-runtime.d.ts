/**
 * Wix Server-Runtime Module Type Declarations
 * ==============================================
 */

type AnyRecord = Record<string, any>;

declare module "wix-web-module" {
  type Permission = "Anyone" | "SiteMember" | "SiteMemberAuthor" | "Admin";

  export const Permissions: {
    Anyone: Permission;
    SiteMember: Permission;
    SiteMemberAuthor: Permission;
    Admin: Permission;
  };

  export function webMethod<T extends (...args: unknown[]) => unknown>(
    permission: Permission,
    handler: T
  ): T;
}

declare module "wix-data" {
  const wixData: {
    query(collectionName: string): any;
    insert(collectionName: string, item: AnyRecord, options?: { suppressAuth?: boolean }): Promise<AnyRecord>;
    update(collectionName: string, item: AnyRecord, options?: { suppressAuth?: boolean }): Promise<AnyRecord>;
    get(collectionName: string, itemId: string, options?: { suppressAuth?: boolean }): Promise<AnyRecord | null>;
  };
  export default wixData;
}
