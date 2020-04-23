import { Component } from '@angular/core';
import { ProductsService } from './products.service';
import { Observer, Observable } from 'rxjs';
import { Product } from './models/Product.model';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  simpleReqProductsObs$: Observable<Product[]>;
  productsErrorHandling: Product[];
  bLoading: boolean = false;
  color: string = "";
  productsId: Product[];

  constructor(
    private productsService: ProductsService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    //this.productsService.getProducts().subscribe(prods => console.log(prods))
  }

  getSimpleHttpRequest() {
    this.simpleReqProductsObs$ = this.productsService.getProducts();
  }

  getProductsWithErrorHandling() {
    this.productsErrorHandling = null;
    this.color = "accent";
    this.bLoading = true;

    this.productsService.getProductsError()
      .subscribe(
        (prods) => {
          this.productsErrorHandling = prods;
          this.bLoading = false;

        },
        (err) => {
          console.log(err);
          console.log("Message: " + err.error.msg);
          console.log("Status: " + err.status);
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack-error'];

          if (err.status == 0)
            this.snackBar.open("Could not connect to the server ", '', config);
          else
            this.snackBar.open(err.error.msg, '', config);

          this.bLoading = false;

        },

      )
  }

  getProductsWithErrorHandlingOk() {
    this.productsErrorHandling = null;
    this.color = "primary";
    this.bLoading = true;
    this.productsService.getProductsDelay()
      .subscribe(
        (prods) => {
          this.productsErrorHandling = prods;
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack-ok'];
          this.snackBar.open("Products succesfully loaded! ", '', config);
          this.bLoading = false;
        },
        (err) => {
          console.log(err);
          this.bLoading = false;
        }
      )
  }

  getProductsIds() {
    this.productsService.getProductsIds()
      .subscribe((ids) => {
        this.productsId = ids.map(id => ({
          _id: id, name: '', department: '', price: 0
        }));
      });
  }

  loadName(id: string) {
    this.productsService.getProductById(id)
      .subscribe((prod => {
        let index = this.productsId.findIndex(p => p._id === id);
        if(index >= 0)
          this.productsId[index].name = prod.name;

      }
      ));
  }


}
