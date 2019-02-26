import { Injectable } from '@angular/core'

import { Observable ,  Observer ,  of ,  range ,  timer, throwError } from 'rxjs'
import { filter, catchError, retryWhen, zip, mergeMap } from 'rxjs/operators'

export interface Script {
  name: string
  src: string
  loaded: boolean
}

@Injectable()
export class ScriptLoaderService {
  private scripts: Script[] = []

  public load(script: Script): Observable<Script> {
    return new Observable<Script>((observer: Observer<Script>) => {
      var existingScript = this.scripts.find((s) => s.name == script.name)

      // Complete if already loaded
      // if (existingScript && existingScript.loaded) {
      //   observer.next(existingScript)
      //   observer.complete()
      // } else {
        // Add the script
        this.scripts = [...this.scripts, script]

        // Load the script
        let scriptElement = document.createElement('script')
        scriptElement.type = 'text/javascript'
        scriptElement.src = script.src

        scriptElement.onload = () => {
          script.loaded = true
          observer.next(script)
          observer.complete()
        }

        scriptElement.onerror = (error: any) => {
          observer.error("Couldn't load script " + script.src)
        }

        document.getElementsByTagName('body')[0].appendChild(scriptElement)
      // }
    }).pipe(
      retryWhen((attempts) => {
        return attempts.pipe(
          zip(range(1, 4)),
          mergeMap(([error, i]) => {
            if (i > 3) {
              return throwError(error)
            }
            return timer(i * 1000)
          }),
        )
      }),
      filter((script) => script.loaded),
    )
  }
}
