import Dexie, {Table} from 'dexie';
import {ApplicationDetail} from "@lowcoder-ee/constants/applicationConstants";

export class LowcoderDexie extends Dexie {
    // 'apps' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    apps!: Table<ApplicationDetail>;

    constructor() {
        super('lowcoder');
        this.version(1).stores({
            apps: 'applicationInfoView.applicationId' // Primary key and indexed props
        });
    }
}

export const db = new LowcoderDexie();