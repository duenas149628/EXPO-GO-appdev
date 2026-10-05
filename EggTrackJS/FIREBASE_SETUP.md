# Firebase business accounts on the Spark plan

EggTrack uses a separate Firebase Authentication login for each person. One Owner account is connected to one business workspace, and the Owner can create individual Staff email/password logins from Settings. Staff records and operational data are separated by `businessId` and protected by Firestore Security Rules.

This implementation does not use Cloud Functions, Artifact Registry, or a billing-enabled service. Firebase Authentication and Firestore are available on Spark within their free quotas. Usage beyond Spark limits can require a plan change, so monitor the project's usage in Firebase Console.

## First setup and existing data

Enable Email/Password under Firebase Console → Authentication → Sign-in method and confirm Firestore is enabled. A new signup creates the business and Owner profile together. An existing pre-provisioned Owner without a `businessId` is offered a one-time migration that moves the current inventory and settings into their business and tags existing sales and production records with that business ID. This keeps the existing Firebase test records.

If setup is interrupted, sign in again with the same Owner account and retry. The migration lock prevents a newly created business from claiming the legacy records. Data that exists only in a device's local storage is not copied by this migration.

The Owner creates Staff logins from Settings. Share the initial password securely; Staff can sign in with their own email and password. Disabling a Staff profile blocks app access and Firestore data access. Firebase Authentication still accepts the credentials, since remotely disabling an Auth user requires a trusted server/admin environment.

## Deploy Firestore rules

After installing the updated app, deploy only the Firestore rules from the project root:

```powershell
npx firebase-tools deploy --project eggtrack-a01ac --only firestore:rules
```

This deployment does not require Blaze. Deploying the new rules before using this updated app can prevent the older app version from accessing its operational records.
