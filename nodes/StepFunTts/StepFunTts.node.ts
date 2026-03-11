import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  NodeConnectionType,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

const DEFAULT_VOICES: Array<{ name: string; value: string }> = [
  { name: 'Lively Girl (English)', value: 'lively-girl' },
  { name: 'Vibrant Youth (English)', value: 'vibrant-youth' },
  { name: 'Soft-spoken Gentleman (English)', value: 'soft-spoken-gentleman' },
  { name: 'Magnetic-voiced Male (English)', value: 'magnetic-voiced-male' },
  { name: 'Gentle Lady (Chinese)', value: 'elegantgentle-female' },
  { name: 'Breezy Girl (Chinese)', value: 'livelybreezy-female' },
  { name: 'Confident Gentleman (Chinese)', value: 'zixinnansheng' },
];

const ALLOWED_OUTPUT_FORMATS = ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'];

const stripSurroundingQuotes = (value: string): string => {
  if (value.length < 2) {
    return value;
  }

  const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
  const isSingleQuoted = value.startsWith("'") && value.endsWith("'");

  if (isDoubleQuoted || isSingleQuoted) {
    return value.slice(1, -1);
  }

  return value;
};

const normalizeOptionValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  const text = String(value);
  return stripSurroundingQuotes(text);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractReturnUrlResponse = (
  payload: unknown,
): { created?: number; audioUrl?: string } => {
  if (!isRecord(payload)) {
    return {};
  }

  const data = isRecord(payload.data) ? payload.data : undefined;
  const created = typeof payload.created === 'number' ? payload.created : undefined;
  const audioUrl = typeof data?.url === 'string' && data.url.trim().length > 0 ? data.url : undefined;

  return {
    created,
    audioUrl,
  };
};

export class StepFunTts implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Stepfun.ai',
    name: 'stepFunTts',
    group: ['transform'],
    version: 1,
    description: 'Convert Text Into Speech using Stepfun.ai\'s Model (TTS)',
    subtitle: '={{$parameter["model"]}}',
    documentationUrl: 'https://platform.stepfun.ai/',
    icon: 'file:stepfun.png',
    codex: {
      categories: ['AI', 'Audio'],
      subcategories: {
        AI: ['Text to Speech'],
        Audio: ['Synthesis'],
      },
      resources: {
        primaryDocumentation: [
          {
            url: 'https://platform.stepfun.ai/',
          },
        ],
      },
      alias: ['tts', 'text to speech', 'text-to-speech', 'speech synthesis', 'voice', 'stepfun'],
    },
    defaults: {
      name: 'Convert Text Into Speech',
    },
    inputs: [
      {
        type: 'main' as NodeConnectionType,
        required: false,
      },
    ],
    requiredInputs: 0,
    outputs: ['main'],
    credentials: [
      {
        name: 'stepFunApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        default: '',
        required: true,
        description: 'The text to convert to speech (max 1000 characters)',
        typeOptions: {
          rows: 4,
        },
      },
      {
        displayName: 'Voice',
        name: 'voice',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getVoices',
        },
        default: '',
        required: true,
        description: 'The voice to use for speech synthesis',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        options: [
          { name: 'step-tts-2', value: 'step-tts-2' },
        ],
        default: 'step-tts-2',
        required: true,
        description: 'The TTS model to use',
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          { name: 'MP3', value: 'mp3' },
          { name: 'Opus', value: 'opus' },
          { name: 'AAC', value: 'aac' },
          { name: 'FLAC', value: 'flac' },
          { name: 'WAV', value: 'wav' },
          { name: 'PCM', value: 'pcm' },
        ],
        default: 'mp3',
        description: 'The audio format of the generated file URL',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getVoices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('stepFunApi');
        const apiKey = credentials.apiKey as string;
        const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

        try {
          const response = await this.helpers.httpRequest({
            method: 'GET',
            url: `${baseUrl}/audio/system_voices?model=step-tts-2`,
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });

          const parsed = typeof response === 'string' ? JSON.parse(response) : response;
          const voices: IDataObject[] = Array.isArray(parsed)
            ? parsed
            : (parsed.data ?? parsed.voices ?? []);

          if (voices.length) {
            return voices.map((voice: IDataObject) => {
              const v = voice as Record<string, unknown>;
              const rawName = (v.name ?? v.display_name ?? v.label ?? v.voice_name ?? v.id ?? v.voice_id ?? JSON.stringify(voice)) as string;
              const rawValue = (v.id ?? v.voice_id ?? v.voice ?? v.name ?? JSON.stringify(voice)) as string;
              return {
                name: normalizeOptionValue(rawName),
                value: normalizeOptionValue(rawValue),
              };
            });
          }
        } catch {
          // API unavailable, fall through to defaults
        }

        return DEFAULT_VOICES;
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const inputItems = this.getInputData();
    const hasInputItems = inputItems.length > 0;
    const items = hasInputItems ? inputItems : ([{ json: {} }] as INodeExecutionData[]);
    const returnData: INodeExecutionData[] = [];

    const credentials = (await this.getCredentials('stepFunApi')) as unknown as { baseUrl: string };
    const baseUrl = credentials.baseUrl.replace(/\/+$/, '');

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const text = this.getNodeParameter('text', itemIndex) as string;
        if (!text?.trim()) {
          throw new NodeOperationError(this.getNode(), 'Text is required', { itemIndex });
        }

        const voice = this.getNodeParameter('voice', itemIndex) as string;
        const model = this.getNodeParameter('model', itemIndex) as string;
        const outputFormat = this.getNodeParameter('outputFormat', itemIndex) as string;
        if (!ALLOWED_OUTPUT_FORMATS.includes(outputFormat)) {
          throw new NodeOperationError(
            this.getNode(),
            `Invalid output format: ${outputFormat}. Allowed formats: ${ALLOWED_OUTPUT_FORMATS.join(', ')}`,
            { itemIndex },
          );
        }

        const body: IDataObject = {
          model,
          input: text,
          voice,
          response_format: outputFormat,
          return_url: true,
        };

        const requestOptions: IHttpRequestOptions = {
          method: 'POST',
          url: `${baseUrl}/audio/speech`,
          body,
          json: true,
        };

        const urlResponse = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'stepFunApi',
          requestOptions,
        );
        const parsedResponse = extractReturnUrlResponse(urlResponse);

        if (!parsedResponse.audioUrl) {
          throw new NodeOperationError(
            this.getNode(),
            'Stepfun API did not return `data.url`.',
            { itemIndex },
          );
        }

        const outputItem: INodeExecutionData = {
          json: {
            text,
            voice,
            model,
            outputFormat,
            created: parsedResponse.created,
            audioUrl: parsedResponse.audioUrl,
          },
        };

        if (hasInputItems) {
          outputItem.pairedItem = { item: itemIndex };
        }

        returnData.push(outputItem);
      } catch (error) {
        const errorResponse: JsonObject =
          typeof error === 'object' && error !== null
            ? (error as JsonObject)
            : ({ message: String(error) } as JsonObject);
        throw new NodeApiError(this.getNode(), errorResponse, { itemIndex });
      }
    }

    return [returnData];
  }
}
