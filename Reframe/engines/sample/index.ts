import { IMetaReframe, IOptionStartEngine } from "@/Reframe";

export default function SampleEngine(meta: IMetaReframe, options: IOptionStartEngine) {
    console.log({
        meta,
        options
    });

    // Here your engine code...
}