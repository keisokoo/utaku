export type RemapBodyMode = 'add' | { id: string } | null

export const stepList = [
  'name',
  'reference_url',
  'host',
  'sub_domain',
  'params',
  'path_change',
  'replace',
] as const

export type StepNameType = typeof stepList[number]

export const getIndexByStepName = (stepName: StepNameType) => stepList.indexOf(stepName)