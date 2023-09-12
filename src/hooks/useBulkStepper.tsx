import { useCallback, useMemo, useState } from 'react'
import { useBulkInput } from './useBulkInput'

export const objectKeys = <T extends object, K extends keyof T>(
  value: T
): K[] => {
  return Object.keys(value) as K[]
}

type KeysMapping<T, K extends { [key: string]: (keyof T)[] }> = {
  [P in keyof K]: Pick<T, K[P][number]>
}
type RestoreTypes = 'after' | 'from-current' | 'current-only'

type CustomValidations<
  T,
  J extends { [key: string]: (keyof T)[] },
  K extends keyof J,
> = {
  [P in J[K][number]]?: (currentValue: T[P]) => boolean
}
export function getStepsInputs<T, J extends { [key: string]: (keyof T)[] }>(
  initialValue: T,
  values: J
): KeysMapping<T, J> {
  return Object.keys(values).reduce(
    (prev, curr) => {
      prev[curr as keyof typeof prev] = values[
        curr as keyof typeof prev
      ].reduce(
        (prevInner, currInner) => {
          prevInner[currInner as keyof typeof prevInner] =
            initialValue[currInner as keyof typeof prevInner]
          return prevInner
        },
        {} as Pick<T, keyof T>
      )
      return prev
    },
    {} as KeysMapping<T, J>
  )
}
export type StepperOptions<
  T extends object,
  J extends { [key: string]: (keyof T)[] },
  // K extends keyof J
> = {
  restoreWhenPrevButtonClicked?: boolean
  customValidations?: {
    [P in keyof J]?: CustomValidations<T, J, P>
  }
  optionalValue?: (keyof T)[]
}
export const useBulkStepper = <
  T extends object,
  J extends { [key: string]: (keyof T)[] },
  K extends keyof J,
>(
  initialValue: T,
  values: J,
  configs?: StepperOptions<T, J>
) => {
  const matchInputs = useBulkInput(initialValue)
  const [stepper, set_stepper] = useState<K | null>()

  const stepsInputs = useMemo(() => {
    return getStepsInputs(matchInputs.inputs, values)
  }, [matchInputs.inputs])

  const allSteps = useMemo(() => {
    return objectKeys(stepsInputs) as K[]
  }, [stepsInputs])

  const currentStep = useMemo(() => {
    const currentStepper = stepper ? stepper : (objectKeys(stepsInputs)[0] as K)
    return currentStepper
  }, [stepper, stepsInputs])

  const checkValidStep = useCallback<
    (
      step: K,
      customValidations?: CustomValidations<T, J, K> | null,
      optional?: (keyof T)[]
    ) => boolean
  >(
    (step, customValidations, optional) => {
      let isValid = true
      const stepInputs = stepsInputs[step]
      const stepInputsKeyNames = objectKeys(stepInputs)
      const stepInputsValid = stepInputsKeyNames.every((keyName) => {
        if (optional && optional.includes(keyName)) return true
        const value = stepInputs[keyName]
        if (customValidations && customValidations[keyName]) {
          return customValidations[keyName]!(value)
        }
        const checkValid = Array.isArray(value)
          ? (value as Array<unknown>).length > 0
          : typeof value === 'boolean' || typeof value === 'string'
          ? !!value
          : value !== undefined && value !== null
        return checkValid
      })
      if (!stepInputsValid) {
        isValid = false
      }
      return isValid
    },
    [stepsInputs]
  )

  // checkValidStep을 이용하여, 각 스테퍼 별로 유효성 검사를 수행하고, 각 각 스테퍼별로 유효성 검사를 수행한 결과를 반환한다.
  const validSteps = useMemo(() => {
    const stepsValid: { [P in keyof J]?: boolean } = {}
    allSteps.forEach((step) => {
      stepsValid[step] = checkValidStep(
        step,
        configs?.customValidations?.[step],
        configs?.optionalValue
      )
    })
    return stepsValid
  }, [allSteps, checkValidStep])

  const validAllSteps = useMemo(() => {
    let isValid = true
    const allStepsValid = allSteps.every((step) => {
      return checkValidStep(
        step,
        configs?.customValidations?.[step],
        configs?.optionalValue
      )
    })
    if (!allStepsValid) {
      isValid = false
    }
    return isValid
  }, [allSteps, checkValidStep])

  const callRestoreByKeyNames = useCallback(
    (restoreSteps: K[]) => {
      const restoreInputsKeyNames = restoreSteps
        .map((step) => {
          return objectKeys(stepsInputs[step])
        })
        .flat()
      matchInputs.restoreByKeyNames(restoreInputsKeyNames)
    },
    [matchInputs, stepsInputs]
  )

  const nextStep = useCallback(() => {
    const currentStepper = stepper ? stepper : (objectKeys(stepsInputs)[0] as K)
    const currentIndex = allSteps.indexOf(currentStepper)
    if (currentIndex < allSteps.length - 1) {
      set_stepper(allSteps[currentIndex + 1])
    }
  }, [allSteps, stepper, stepsInputs])

  const prevStep = useCallback(() => {
    const currentStepper = stepper ? stepper : (objectKeys(stepsInputs)[0] as K)
    const currentIndex = allSteps.indexOf(currentStepper)
    if (currentIndex > 0) {
      if (configs?.restoreWhenPrevButtonClicked) {
        const restoreSteps = allSteps.slice(currentIndex)
        callRestoreByKeyNames(restoreSteps)
      }
      set_stepper(allSteps[currentIndex - 1])
    }
  }, [stepper, stepsInputs, allSteps, callRestoreByKeyNames])

  const setCurrentStep = useCallback(
    (step: K, restore?: RestoreTypes) => {
      if (restore) {
        const currentIndex =
          allSteps.indexOf(step) + restore === 'after' ? 1 : 0
        if (currentIndex > 0) {
          const restoreSteps = allSteps.slice(currentIndex)
          callRestoreByKeyNames(
            restore === 'current-only' ? [step] : restoreSteps
          )
        }
      }
      set_stepper(step)
    },
    [allSteps, callRestoreByKeyNames]
  )

  return {
    currentStep,
    setCurrentStep,
    allSteps,
    stepsInputs,
    matchInputs,
    checkValidStep,
    validSteps,
    validAllSteps,
    prevStep,
    nextStep,
  }
}
