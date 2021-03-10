import {
    AbstractControl, AsyncValidator,
    NG_ASYNC_VALIDATORS,
    ValidationErrors
} from '@angular/forms';
import { Directive, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { IndexType } from '../index-type.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Directive({
    selector: '[duplicateNameValidator][ngModel],[duplicateNameValidator][FormControl]',
    providers: [
        { provide: NG_ASYNC_VALIDATORS, useExisting: DuplicateNameValidator, multi: true }
    ]
})
export class DuplicateNameValidator implements AsyncValidator {

    index_types: IndexType[] = [];

    @Input() value: number;

    constructor(private http: HttpClient) { }

    validate(control: AbstractControl): Observable<ValidationErrors | null> {

        const obs = this.http
            .get<IndexType[]>('https://life-saver-backend.firebaseio.com/indexTypes.json')
            .pipe(
                map((res) => {
                    this.index_types = res;

                    let valid = this.index_types.find(it => it.Name === control.value && it.ID !== this.value) === undefined;
                    return valid ? null : {
                        duplicateNameValidator: true
                    };
                })
            )

        return obs;
    }
}